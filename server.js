const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const environment = {
  environmentType: "synthetic_demo",
  systemId: "LOCAL_S4_DEMO",
  datasetId: "sap-discovery-demo-v1"
};

const businessPartners = [
  {
    BusinessPartner: "1018",
    BusinessPartnerCategory: "2",
    BusinessPartnerFullName: "Bechtle AG",
    OrganizationBPName1: "Bechtle AG",
    BusinessPartnerIsBlocked: false,
    Country: "DE"
  },
  {
    BusinessPartner: "202",
    BusinessPartnerCategory: "2",
    BusinessPartnerFullName: "EBIKE Atlanta",
    OrganizationBPName1: "EBIKE Atlanta",
    BusinessPartnerIsBlocked: false,
    Country: "US"
  },
  {
    BusinessPartner: "203",
    BusinessPartnerCategory: "2",
    BusinessPartnerFullName: "EBIKE Atlanta",
    OrganizationBPName1: "EBIKE Atlanta",
    BusinessPartnerIsBlocked: false,
    Country: "US"
  },
  {
    BusinessPartner: "3001",
    BusinessPartnerCategory: "2",
    BusinessPartnerFullName: "Demo Industrial GmbH",
    OrganizationBPName1: "Demo Industrial GmbH",
    BusinessPartnerIsBlocked: false,
    Country: "AT"
  }
];

const customers = [
  {
    Customer: "202",
    BusinessPartner: "202",
    CustomerName: "EBIKE Atlanta",
    CityName: "Atlanta",
    PostalCode: "30301"
  },
  {
    Customer: "203",
    BusinessPartner: "203",
    CustomerName: "EBIKE Atlanta",
    CityName: "Atlanta",
    PostalCode: "30301"
  }
];

const suppliers = [
  {
    Supplier: "1018",
    BusinessPartner: "1018",
    SupplierName: "Bechtle AG",
    PostingIsBlocked: false,
    PurchasingIsBlocked: false,
    PaymentIsBlockedForSupplier: false
  },
  {
    Supplier: "3001",
    BusinessPartner: "3001",
    SupplierName: "Demo Industrial GmbH",
    PostingIsBlocked: true,
    PurchasingIsBlocked: false,
    PaymentIsBlockedForSupplier: false
  }
];

function getTop(value) {
  const n = Number(value || 5);
  return Math.max(1, Math.min(Number.isFinite(n) ? n : 5, 20));
}

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    environment
  });
});

app.get("/business-partners", (req, res) => {
  res.json({
    environment,
    results: businessPartners.slice(0, getTop(req.query.top))
  });
});

app.get("/business-partners/:businessPartnerId", (req, res) => {
  const bp = businessPartners.find(
    x => x.BusinessPartner === req.params.businessPartnerId
  );

  if (!bp) {
    return res.json({
      environment,
      status: "not_found",
      businessPartnerId: req.params.businessPartnerId
    });
  }

  res.json({
    environment,
    status: "resolved",
    result: bp
  });
});

app.get("/customers", (req, res) => {
  res.json({
    environment,
    results: customers.slice(0, getTop(req.query.top))
  });
});

app.get("/suppliers", (req, res) => {
  res.json({
    environment,
    results: suppliers.slice(0, getTop(req.query.top))
  });
});

app.get("/resolve-sap-object", (req, res) => {
  const hint = String(req.query.objectHint || "").trim().toLowerCase();
  const type = String(req.query.objectType || "unknown");

  if (!hint) {
    return res.status(400).json({
      environment,
      error: "objectHint is required"
    });
  }

  let candidates = [];

  if (type === "supplier" || type === "unknown") {
    candidates.push(
      ...suppliers.map(x => ({
        objectType: "supplier",
        id: x.Supplier,
        businessPartnerId: x.BusinessPartner,
        name: x.SupplierName
      }))
    );
  }

  if (type === "customer" || type === "unknown") {
    candidates.push(
      ...customers.map(x => ({
        objectType: "customer",
        id: x.Customer,
        businessPartnerId: x.BusinessPartner,
        name: x.CustomerName
      }))
    );
  }

  if (type === "business_partner" || type === "unknown") {
    candidates.push(
      ...businessPartners.map(x => ({
        objectType: "business_partner",
        id: x.BusinessPartner,
        businessPartnerId: x.BusinessPartner,
        name: x.BusinessPartnerFullName
      }))
    );
  }

  const matches = candidates.filter(x =>
    x.id.toLowerCase() === hint ||
    x.name.toLowerCase() === hint ||
    x.name.toLowerCase().includes(hint)
  );

  res.json({
    environment,
    status:
      matches.length === 0
        ? "not_found"
        : matches.length === 1
          ? "resolved"
          : "ambiguous",
    matches
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SAP discovery demo API running on port ${PORT}`);
});