"use client";

import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ruler,
  TrendingUp,
  Percent,
  Calculator,
  Compass,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";

// Area unit factors relative to 1 sqft
const AREA_UNITS = [
  { key: "sqft", name: "Square Feet", label: "sqft", factor: 1 },
  { key: "sqm", name: "Square Meters", label: "sqm", factor: 10.76391 },
  { key: "sqyd", name: "Square Yards (Gaj)", label: "sqyd", factor: 9 },
  { key: "guntha", name: "Gunthas", label: "guntha", factor: 1089 },
  { key: "acre", name: "Acres", label: "acre", factor: 43560 },
  { key: "hectare", name: "Hectares", label: "hectare", factor: 107639.1 },
];

export default function CalculatorsPage() {
  // Area Converter State
  const [areaVal, setAreaVal] = useState<string>("1000");
  const [areaUnit, setAreaUnit] = useState<string>("sqft");
  const [convertedAreas, setConvertedAreas] = useState<Record<string, number>>(
    {},
  );

  // Rate Converter State
  const [rateVal, setRateVal] = useState<string>("5000");
  const [rateUnit, setRateUnit] = useState<string>("sqft");
  const [convertedRates, setConvertedRates] = useState<Record<string, number>>(
    {},
  );

  // Carpet Estimator State
  const [generalArea, setGeneralArea] = useState<string>("1200");
  const [areaType, setAreaType] = useState<"builtup" | "super">("super");
  const [customFactor, setCustomFactor] = useState<string>("0.70");
  const [estimatorRate, setEstimatorRate] = useState<string>("8000");
  const [estimatorRateUnit, setEstimatorRateUnit] = useState<string>("sqft");

  // Loan EMI State
  const [loanAmount, setLoanAmount] = useState<string>("5000000");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [loanTenure, setLoanTenure] = useState<string>("20");
  const [emiResults, setEmiResults] = useState({
    monthlyEmi: 0,
    totalInterest: 0,
    totalPayment: 0,
  });

  // Calculate Area Conversions
  useEffect(() => {
    const num = parseFloat(areaVal);
    if (Number.isNaN(num) || num <= 0) {
      setConvertedAreas({});
      return;
    }
    const currentUnit = AREA_UNITS.find((u) => u.key === areaUnit);
    if (!currentUnit) return;

    const valueInSqft = num * currentUnit.factor;
    const results: Record<string, number> = {};
    AREA_UNITS.forEach((u) => {
      results[u.key] = valueInSqft / u.factor;
    });
    setConvertedAreas(results);
  }, [areaVal, areaUnit]);

  // Calculate Rate Conversions
  useEffect(() => {
    const num = parseFloat(rateVal);
    if (Number.isNaN(num) || num <= 0) {
      setConvertedRates({});
      return;
    }
    const currentUnit = AREA_UNITS.find((u) => u.key === rateUnit);
    if (!currentUnit) return;

    // Rate is inverse of area (Rate per Sqft = Rate / 1; Rate per Sqm = Rate * 10.76391)
    const rateInSqft = num / currentUnit.factor;
    const results: Record<string, number> = {};
    AREA_UNITS.forEach((u) => {
      results[u.key] = rateInSqft * u.factor;
    });
    setConvertedRates(results);
  }, [rateVal, rateUnit]);

  // Update default factor based on area type selection
  useEffect(() => {
    if (areaType === "builtup") {
      setCustomFactor("0.80");
    } else {
      setCustomFactor("0.70");
    }
  }, [areaType]);

  // Calculate EMI
  useEffect(() => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTenure);

    if (
      Number.isNaN(principal) ||
      principal <= 0 ||
      Number.isNaN(annualRate) ||
      annualRate <= 0 ||
      Number.isNaN(years) ||
      years <= 0
    ) {
      setEmiResults({ monthlyEmi: 0, totalInterest: 0, totalPayment: 0 });
      return;
    }

    const r = annualRate / (12 * 100);
    const n = years * 12;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;

    setEmiResults({
      monthlyEmi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    });
  }, [loanAmount, interestRate, loanTenure]);

  // Carpet Calculations
  const calculatedCarpet = parseFloat(generalArea) * parseFloat(customFactor);

  const estRateUnitObj = AREA_UNITS.find((u) => u.key === estimatorRateUnit);
  const estRateFactor = estRateUnitObj ? estRateUnitObj.factor : 1;

  const totalCost =
    !Number.isNaN(parseFloat(generalArea)) &&
    !Number.isNaN(parseFloat(estimatorRate))
      ? (parseFloat(generalArea) / estRateFactor) * parseFloat(estimatorRate)
      : 0;

  const effectiveRateInSelectedUnit =
    !Number.isNaN(parseFloat(estimatorRate)) && parseFloat(customFactor) > 0
      ? parseFloat(estimatorRate) / parseFloat(customFactor)
      : 0;

  const effectiveRateInSqft =
    calculatedCarpet > 0 ? totalCost / calculatedCarpet : 0;

  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-12"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* 🏙️ PREMIUM HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-[64px] items-center gap-4 sm:gap-6 px-8">
          <SidebarTrigger className="cursor-pointer hover:bg-muted/50 transition-colors p-2 rounded-md -ml-2" />
          <div className="h-6 w-px bg-border/60 hidden sm:block" aria-hidden="true"></div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
              Tools
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
              Convert units, estimate carpet areas, and calculate valuations
            </p>
          </div>
        </div>
      </header>

      <main className="p-8 w-full max-w-screen-2xl space-y-8">
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="mb-6 h-11! bg-muted/60 p-1 rounded-xl flex overflow-x-auto justify-start w-full max-w-full">
            <TabsTrigger
              value="area"
              className="gap-2 cursor-pointer px-4 rounded-lg font-semibold text-xs h-full shrink-0"
            >
              <Ruler className="h-4 w-4" />
              Area Converter
            </TabsTrigger>
            <TabsTrigger
              value="rate"
              className="gap-2 cursor-pointer px-4 rounded-lg font-semibold text-xs h-full shrink-0"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Rate Converter
            </TabsTrigger>
            <TabsTrigger
              value="carpet"
              className="gap-2 cursor-pointer px-4 rounded-lg font-semibold text-xs h-full shrink-0"
            >
              <Compass className="h-4 w-4" />
              Carpet Estimator
            </TabsTrigger>
            <TabsTrigger
              value="emi"
              className="gap-2 cursor-pointer px-4 rounded-lg font-semibold text-xs h-full shrink-0"
            >
              <Calculator className="h-4 w-4" />
              Loan EMI
            </TabsTrigger>
          </TabsList>

          {/* 📐 AREA CONVERTER */}
          <TabsContent value="area" className="space-y-6 outline-none">
            <Card className="border-border/80 shadow-none">
              <CardHeader className="border-b border-border/40 pb-4 bg-muted/5">
                <CardTitle className="font-bold">
                  Real Estate Area Unit Converter
                </CardTitle>
                <CardDescription>
                  Convert any plot or floor area metric into standard Indian and
                  global property units.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label
                      htmlFor="areaVal"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Input Value
                    </Label>
                    <Input
                      id="areaVal"
                      type="number"
                      value={areaVal}
                      onChange={(e) => setAreaVal(e.target.value)}
                      placeholder="Enter value..."
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="areaUnit"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Source Unit
                    </Label>
                    <Select value={areaUnit} onValueChange={setAreaUnit}>
                      <SelectTrigger
                        id="areaUnit"
                        className="h-11 rounded-lg border-border"
                      >
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                        {AREA_UNITS.map((u) => (
                          <SelectItem
                            key={u.key}
                            value={u.key}
                            className="cursor-pointer rounded-md"
                          >
                            {u.name} ({u.label})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {AREA_UNITS.map((unit) => {
                    const value = convertedAreas[unit.key];
                    const isSource = unit.key === areaUnit;
                    return (
                      <div
                        key={unit.key}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                          isSource
                            ? "bg-muted/40 border-foreground/30 ring-1 ring-foreground/10"
                            : "bg-card border-border/80 hover:border-foreground/20"
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          {unit.name} ({unit.label})
                        </span>
                        <span className="text-xl font-bold text-foreground mt-3 font-mono">
                          {value !== undefined
                            ? value.toLocaleString("en-IN", {
                                maximumFractionDigits: 4,
                              })
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 💹 RATE CONVERTER */}
          <TabsContent value="rate" className="space-y-6 outline-none">
            <Card className="border-border/80 shadow-none">
              <CardHeader className="border-b border-border/40 pb-4 bg-muted/5">
                <CardTitle className="font-bold">
                  Valuation Rate Converter
                </CardTitle>
                <CardDescription>
                  Convert property price per unit area (e.g. ₹ per sqft to ₹ per
                  sqm or sqyd).
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label
                      htmlFor="rateVal"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Rate / Price (₹)
                    </Label>
                    <Input
                      id="rateVal"
                      type="number"
                      value={rateVal}
                      onChange={(e) => setRateVal(e.target.value)}
                      placeholder="Enter rate..."
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="rateUnit"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Per Unit Area
                    </Label>
                    <Select value={rateUnit} onValueChange={setRateUnit}>
                      <SelectTrigger
                        id="rateUnit"
                        className="h-11 rounded-lg border-border"
                      >
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                        {AREA_UNITS.slice(0, 3).map((u) => (
                          <SelectItem
                            key={u.key}
                            value={u.key}
                            className="cursor-pointer rounded-md"
                          >
                            Per {u.name} (/{u.label})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {AREA_UNITS.slice(0, 3).map((unit) => {
                    const value = convertedRates[unit.key];
                    const isSource = unit.key === rateUnit;
                    return (
                      <div
                        key={unit.key}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                          isSource
                            ? "bg-muted/40 border-foreground/30 ring-1 ring-foreground/10"
                            : "bg-card border-border/80 hover:border-foreground/20"
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Rate per {unit.name} (/{unit.label})
                        </span>
                        <span className="text-xl font-bold text-foreground mt-3 font-mono">
                          {value !== undefined
                            ? "₹ " +
                              value.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🧭 CARPET ESTIMATOR */}
          <TabsContent value="carpet" className="space-y-6 outline-none">
            <Card className="border-border/80 shadow-none">
              <CardHeader className="border-b border-border/40 pb-4 bg-muted/5">
                <CardTitle className="font-bold">
                  Carpet Area & Valuation Estimator
                </CardTitle>
                <CardDescription>
                  Estimate real carpet area from general area types and analyze
                  valuation metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="genArea"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      General Area (sqft)
                    </Label>
                    <Input
                      id="genArea"
                      type="number"
                      value={generalArea}
                      onChange={(e) => setGeneralArea(e.target.value)}
                      placeholder="e.g. 1200"
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="areaType"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Area Label Type
                    </Label>
                    <Select
                      value={areaType}
                      onValueChange={(val: any) => setAreaType(val)}
                    >
                      <SelectTrigger
                        id="areaType"
                        className="h-11 rounded-lg border-border"
                      >
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                        <SelectItem
                          value="builtup"
                          className="cursor-pointer rounded-md"
                        >
                          Built-up Area
                        </SelectItem>
                        <SelectItem
                          value="super"
                          className="cursor-pointer rounded-md"
                        >
                          Super Built-up / Super Area
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="factor"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Conversion Factor
                    </Label>
                    <Input
                      id="factor"
                      type="number"
                      step={0.01}
                      min={0.5}
                      max={1.0}
                      value={customFactor}
                      onChange={(e) => setCustomFactor(e.target.value)}
                      className="h-11 rounded-lg border-border font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="estimatorRate"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Rate / Price (₹)
                    </Label>
                    <Input
                      id="estimatorRate"
                      type="number"
                      value={estimatorRate}
                      onChange={(e) => setEstimatorRate(e.target.value)}
                      placeholder="e.g. 8000"
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="estimatorRateUnit"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Rate Unit
                    </Label>
                    <Select
                      value={estimatorRateUnit}
                      onValueChange={(val: any) => setEstimatorRateUnit(val)}
                    >
                      <SelectTrigger
                        id="estimatorRateUnit"
                        className="h-11 rounded-lg border-border"
                      >
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                        <SelectItem
                          value="sqft"
                          className="cursor-pointer rounded-md"
                        >
                          Per Sq. Ft. (/sqft)
                        </SelectItem>
                        <SelectItem
                          value="sqm"
                          className="cursor-pointer rounded-md"
                        >
                          Per Sq. Meter (/sqm)
                        </SelectItem>
                        <SelectItem
                          value="sqyd"
                          className="cursor-pointer rounded-md"
                        >
                          Per Sq. Yard (/sqyd)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border/40">
                  <div className="p-5 rounded-xl border border-border bg-card">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Estimated Carpet Area
                    </span>
                    <p className="text-2xl font-bold text-amber-500 mt-2 font-mono">
                      {!Number.isNaN(calculatedCarpet) && calculatedCarpet > 0
                        ? `${calculatedCarpet.toLocaleString("en-IN", {
                            maximumFractionDigits: 1,
                          })} sqft`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      via factor ×{customFactor}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-card">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Total Cost Estimate
                    </span>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">
                      {totalCost > 0
                        ? `₹ ${Math.round(totalCost).toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      based on general area & rate
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-card">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Effective Rate/Carpet
                    </span>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">
                      {effectiveRateInSelectedUnit > 0
                        ? `₹ ${Math.round(effectiveRateInSelectedUnit).toLocaleString("en-IN")}/${estimatorRateUnit}`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {estimatorRateUnit !== "sqft" && effectiveRateInSqft > 0
                        ? `Equivalent to ₹ ${Math.round(effectiveRateInSqft).toLocaleString("en-IN")}/sqft`
                        : "actual cost per carpet area"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🧮 LOAN EMI CALCULATOR */}
          <TabsContent value="emi" className="space-y-6 outline-none">
            <Card className="border-border/80 shadow-none">
              <CardHeader className="border-b border-border/40 pb-4 bg-muted/5">
                <CardTitle className="font-bold">
                  Home Loan EMI Calculator
                </CardTitle>
                <CardDescription>
                  Analyze your monthly payments, payable interest, and overall
                  loan valuation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label
                      htmlFor="amount"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Loan Amount (₹)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="e.g. 5000000"
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="rate"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Interest Rate (% p.a.)
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="tenure"
                      className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Tenure (Years)
                    </Label>
                    <Input
                      id="tenure"
                      type="number"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(e.target.value)}
                      placeholder="e.g. 20"
                      className="h-11 rounded-lg border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
                  <div className="p-5 rounded-xl border border-border bg-card">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Monthly EMI
                    </span>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">
                      {emiResults.monthlyEmi > 0
                        ? `₹ ${emiResults.monthlyEmi.toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      installment per month
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-card">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Total Interest Payable
                    </span>
                    <p className="text-2xl font-bold text-amber-500 mt-2 font-mono">
                      {emiResults.totalInterest > 0
                        ? `₹ ${emiResults.totalInterest.toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      total interest cost
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-card">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Total Cost of Loan
                    </span>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">
                      {emiResults.totalPayment > 0
                        ? `₹ ${emiResults.totalPayment.toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      principal + interest
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
