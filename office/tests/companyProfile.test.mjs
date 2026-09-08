import assert from "node:assert/strict";
import test from "node:test";
import {
  createCompanyProfile, FOUNDING_TEAM_SIZE,
} from "../js/companyProfile.js";

const validProfile = {
  founderName: " Nosh ",
  leadershipStyle: "visionary",
  companyName: " Warewolf ",
  companyMotto: " Software with teeth. ",
  companyFocus: "web-products",
  employeeIds: ["maeve", "fabrizio", "dex"],
};

test("a complete company profile is cleaned and accepted", () => {
  assert.equal(FOUNDING_TEAM_SIZE, 3);
  assert.deepEqual(createCompanyProfile(validProfile), {
    ...validProfile,
    founderName: "Nosh",
    companyName: "Warewolf",
    companyMotto: "Software with teeth.",
  });
});

test("company setup requires names and exactly three known hires", () => {
  assert.equal(createCompanyProfile({
    ...validProfile, companyName: "",
  }), null);
  assert.equal(createCompanyProfile({
    ...validProfile, employeeIds: ["maeve", "dex"],
  }), null);
  assert.equal(createCompanyProfile({
    ...validProfile,
    employeeIds: ["maeve", "fabrizio", "dex", "unknown"],
  })?.employeeIds.length, 3);
  assert.equal(createCompanyProfile({
    ...validProfile, leadershipStyle: "tyrant",
  }), null);
});
