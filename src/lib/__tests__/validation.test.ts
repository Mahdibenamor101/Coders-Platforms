import { describe, expect, it } from "vitest";
import { driverSchema, tractorSchema, orderSchema, loginSchema, signupSchema } from "../validation";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "demo@fleetlink.app", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("requires a password of at least 8 characters", () => {
    const result = signupSchema.safeParse({
      companyName: "Transports Demo",
      name: "Amine",
      email: "demo@fleetlink.app",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("driverSchema", () => {
  it("defaults status to ACTIVE when omitted", () => {
    const result = driverSchema.safeParse({
      firstName: "Karim",
      lastName: "Haddad",
      phone: "+212600000001",
      licenseNumber: "PL-001",
      licenseExpiry: "2027-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("ACTIVE");
    }
  });

  it("rejects a phone number that is too short", () => {
    const result = driverSchema.safeParse({
      firstName: "Karim",
      lastName: "Haddad",
      phone: "123",
      licenseNumber: "PL-001",
      licenseExpiry: "2027-01-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("tractorSchema", () => {
  it("coerces numeric string fields", () => {
    const result = tractorSchema.safeParse({
      plateNumber: "12345-A-6",
      brand: "Volvo",
      model: "FH16",
      mileage: "245000",
      nextMaintenanceMileage: "250000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mileage).toBe(245000);
      expect(result.data.nextMaintenanceMileage).toBe(250000);
    }
  });
});

describe("orderSchema", () => {
  it("defaults priority to MEDIUM and hazmat to false", () => {
    const result = orderSchema.safeParse({
      customerName: "Societe ABC",
      pickupAddress: "Casablanca",
      deliveryAddress: "Rabat",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("MEDIUM");
      expect(result.data.hazmat).toBe(false);
    }
  });

  it("rejects an unknown priority value", () => {
    const result = orderSchema.safeParse({
      customerName: "Societe ABC",
      pickupAddress: "Casablanca",
      deliveryAddress: "Rabat",
      priority: "SUPER_URGENT",
    });
    expect(result.success).toBe(false);
  });
});
