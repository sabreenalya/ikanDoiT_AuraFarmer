import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BiomassPage from "./BiomassPage";

class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;
Element.prototype.scrollIntoView = () => {};

const storageKey = "ikandoit-fish-batches-v1:test-farmer";
const isoDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const twoPondStore = () => ({
  "pond-1": {
    active: {
      id: "pond-1-batch-1",
      pondId: "pond-1",
      species: "Nile Tilapia",
      stockingDate: isoDaysAgo(9),
      status: "Active",
      targetMinWeightG: 400,
      targetMaxWeightG: 500,
      biomassRecords: [{ id: "p1-measure-1", batchId: "pond-1-batch-1", pondId: "pond-1", species: "Nile Tilapia", avgWeight: 0.2, biomass: 250, timestamp: "2026-10-03T10:00:00.000Z" }],
      weightMeasurements: [{ id: "p1-measure-1", batchId: "pond-1-batch-1", pondId: "pond-1", weightG: 200, timestamp: "2026-10-03T10:00:00.000Z" }],
    },
    history: [],
  },
  "pond-2": {
    active: {
      id: "pond-2-batch-1",
      pondId: "pond-2",
      species: "Red Tilapia",
      stockingDate: isoDaysAgo(39),
      status: "Active",
      targetMinWeightG: 450,
      targetMaxWeightG: 600,
      biomassRecords: [],
      weightMeasurements: [],
    },
    history: [],
  },
});

const renderPage = () => render(<BiomassPage user={{ id: "test-farmer" }} setLatestBiomass={() => {}} setBiomassHistory={() => {}} />);

afterEach(() => window.localStorage.clear());

describe("BiomassPage batch management", () => {
  it("seeds Pond 2 with a valid, independent active batch on first use", async () => {
    renderPage();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      expect(saved["pond-2"]?.active?.id).toBe("batch-pond-2-initial");
    });
    const pondSelect = screen.getAllByRole("combobox")[0];
    fireEvent.keyDown(pondSelect, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Pond 2" }));
    await waitFor(() => expect(screen.getByLabelText("Stocking Date")).not.toHaveValue(""));
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    expect(saved["pond-2"].active.stockingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(saved["pond-2"].active.stockingDate).toBe(isoDaysAgo(30));
    expect(saved["pond-2"].active.biomassRecords).toHaveLength(4);
    expect(saved["pond-2"].active.biomassRecords.every((record: { isSample?: boolean }) => !record.isSample)).toBe(true);
    expect(saved["pond-2"].active.sampleDataVersion).toBe(3);
    expect(saved["pond-2"].active.biomassRecords.map((record: { avgWeight: number }) => Math.round(record.avgWeight * 1000))).toEqual([95, 112, 129, 140]);
    expect(saved["pond-2"].active.species).toBe("Red Tilapia");
    expect(saved["pond-2"].active.targetMinWeightG).toBe(450);
    expect(saved["pond-2"].active.targetMaxWeightG).toBe(600);
  });

  it("loads each pond's own batch, DD/MM/YYYY date, species and target", async () => {
    window.localStorage.setItem(storageKey, JSON.stringify(twoPondStore()));
    renderPage();

    await waitFor(() => expect(screen.getByLabelText("Stocking Date")).toHaveValue(isoDaysAgo(9)));
    expect(screen.getAllByText("Nile Tilapia").length).toBeGreaterThan(0);
    expect(screen.getByText((_, node) => node?.textContent === "0 months 9 days")).toBeInTheDocument();
    expect(screen.queryByText("Total Fish in Pond")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Species")).not.toBeInTheDocument();

    const pondSelect = screen.getAllByRole("combobox")[0];
    fireEvent.keyDown(pondSelect, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Pond 2" }));

    await waitFor(() => expect(screen.getByLabelText("Stocking Date")).toHaveValue(isoDaysAgo(39)));
    expect(screen.getAllByText("Red Tilapia").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Minimum target harvest weight in grams per fish")).toHaveValue(450);
    expect(screen.getByLabelText("Maximum target harvest weight in grams per fish")).toHaveValue(600);
  });

  it("saves target ranges and archives the previous batch when a new batch starts", async () => {
    window.localStorage.setItem(storageKey, JSON.stringify(twoPondStore()));
    renderPage();
    await waitFor(() => expect(screen.getByLabelText("Stocking Date")).toHaveValue(isoDaysAgo(9)));

    fireEvent.change(screen.getByLabelText("Minimum target harvest weight in grams per fish"), { target: { value: "420" } });
    fireEvent.change(screen.getByLabelText("Maximum target harvest weight in grams per fish"), { target: { value: "550" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Batch Details" }));
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      expect(saved["pond-1"].active.targetMinWeightG).toBe(420);
      expect(saved["pond-1"].active.targetMaxWeightG).toBe(550);
    });

    fireEvent.click(screen.getByRole("button", { name: "Start New Batch" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Harvest Weight (kg)"), { target: { value: "180" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Next: Batch Details" }));
    const newStockingDate = isoDaysAgo(2);
    fireEvent.change(within(dialog).getByLabelText("Stocking Date"), { target: { value: newStockingDate } });
    fireEvent.change(within(dialog).getByLabelText("Total Fish Stocked"), { target: { value: "500" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Create Batch" }));

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      expect(saved["pond-1"].active.id).not.toBe("pond-1-batch-1");
      expect(saved["pond-1"].active.stockingDate).toBe(newStockingDate);
      expect(saved["pond-1"].active.stockedFishCount).toBe(500);
      expect(saved["pond-1"].history).toHaveLength(1);
      expect(saved["pond-1"].history[0].status).toBe("Harvested");
      expect(saved["pond-1"].history[0].harvestWeightKg).toBe(180);
      expect(saved["pond-1"].history[0].biomassRecords).toHaveLength(1);
      expect(saved["pond-2"].active.id).toBe("pond-2-batch-1");
      expect(saved["pond-2"].active.targetMinWeightG).toBe(450);
    });
  });

  it("rejects malformed dates and target ranges where maximum is below minimum", async () => {
    window.localStorage.setItem(storageKey, JSON.stringify(twoPondStore()));
    renderPage();
    await waitFor(() => expect(screen.getByLabelText("Stocking Date")).toHaveValue(isoDaysAgo(9)));

    fireEvent.change(screen.getByLabelText("Stocking Date"), { target: { value: "2026-02-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Batch Details" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("valid stocking date");

    fireEvent.change(screen.getByLabelText("Stocking Date"), { target: { value: isoDaysAgo(9) } });
    fireEvent.change(screen.getByLabelText("Minimum target harvest weight in grams per fish"), { target: { value: "700" } });
    fireEvent.change(screen.getByLabelText("Maximum target harvest weight in grams per fish"), { target: { value: "600" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Batch Details" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("maximum must be at least the minimum");
  });

  it("calculates using the active batch species without requiring a fish-count field", async () => {
    window.localStorage.setItem(storageKey, JSON.stringify(twoPondStore()));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: () => "blob:test-upload" });
    window.scrollTo = vi.fn();
    renderPage();

    fireEvent.click(screen.getByLabelText("Upload Video"));
    const upload = document.querySelector('input[type="file"]');
    fireEvent.change(upload as HTMLInputElement, { target: { files: [new File(["fish"], "fish.mp4", { type: "video/mp4" })] } });
    fireEvent.click(screen.getByRole("button", { name: "Run Detection" }));
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 2100)); });
    fireEvent.click(screen.getByRole("button", { name: /Calculate Biomass/ }));

    expect(await screen.findByText("Estimation Results")).toBeInTheDocument();
    expect(screen.getAllByText("Nile Tilapia").length).toBeGreaterThan(0);
    expect(screen.queryByText("Fish Count")).not.toBeInTheDocument();
    expect(screen.getByText("250", { exact: true })).toBeInTheDocument();
  });
});
