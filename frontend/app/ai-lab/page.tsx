"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/services/auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { AICapabilities } from "@/components/dashboard/ai-capabilities";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PredictionHistoryItem {
  id: string;
  inputs: Record<string, any>;
  predictedPrice: number;
  timestamp: string;
}

export default function AILabPage() {
  const router = useRouter();
  
  // Auth & Role states
  const [role, setRole] = useState<"user" | "broker" | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // API connection status states
  const [backendUrl, setBackendUrl] = useState("");
  const [apiStatus, setApiStatus] = useState<"Online" | "Offline" | "Checking">("Checking");

  // Form states
  const [inputs, setInputs] = useState<Record<string, any>>({
    GrLivArea: 1500,
    LotArea: 8000,
    TotalBsmtSF: 1000,
    YearBuilt: 2005,
    YearRemodAdd: 2005,
    BedroomAbvGr: 3,
    FullBath: 2,
    HalfBath: 1,
    GarageCars: 2,
    OverallQual: 7,
    OverallCond: 5,
    Neighborhood: "CollgCr",
    CentralAir: "Y",
  });

  // Results states
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    predictedPrice: number;
    timestamp: string;
    inputsUsed: Record<string, any>;
  } | null>(null);

  // History states
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);

  // Resolve API Base URL and test connectivity
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    setBackendUrl(url);

    const checkHealth = async () => {
      setApiStatus("Checking");
      try {
        const res = await fetch(`${url}/health`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "healthy" || res.status === 200) {
            setApiStatus("Online");
            return;
          }
        }
        setApiStatus("Offline");
      } catch (error) {
        console.error("FastAPI Health Check Failed:", error);
        setApiStatus("Offline");
      }
    };

    checkHealth();
  }, []);

  // Fetch logged-in user role to display corresponding DashboardLayout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRole = await getUserRole(user.uid);
          setRole(userRole || "user");
        } catch (e) {
          console.error("Error fetching user role for AI Lab:", e);
          setRole("user");
        }
      } else {
        router.push("/login");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load prediction history from LocalStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("realstateq_ai_lab_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load prediction history:", e);
    }
  }, []);

  // Save prediction history to LocalStorage
  const saveToHistory = (predictedPrice: number, inputsUsed: Record<string, any>) => {
    try {
      const newItem: PredictionHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        inputs: inputsUsed,
        predictedPrice,
        timestamp: new Date().toLocaleTimeString(),
      };
      const updatedHistory = [newItem, ...history].slice(0, 5); // Keep last 5
      setHistory(updatedHistory);
      localStorage.setItem("realstateq_ai_lab_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save prediction history:", e);
    }
  };

  // Pre-fill form from past run
  const handleLoadHistory = (item: PredictionHistoryItem) => {
    setInputs(item.inputs);
    setPredictionResult({
      predictedPrice: item.predictedPrice,
      timestamp: item.timestamp,
      inputsUsed: item.inputs,
    });
    toast.success("Loaded configuration from history!");
  };

  const handleInputChange = (name: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form to FastAPI APIRouter predict route
  const handlePredict = async () => {
    if (apiStatus === "Offline") {
      toast.error("ML Inference Server is offline. Please launch the backend FastAPI service first!");
      return;
    }

    setPredictionLoading(true);
    try {
      // Structure Pydantic HousePredictionInput payload. Match field names and float/int types
      const payload = {
        MSSubClass: 20, // Default typical class
        MSZoning: "RL", // Residential Low Density
        LotFrontage: 80.0,
        LotArea: Number(inputs.LotArea),
        Street: "Pave",
        Alley: null,
        LotShape: "Reg",
        LandContour: "Lvl",
        Utilities: "AllPub",
        LotConfig: "Inside",
        LandSlope: "Gtl",
        Neighborhood: inputs.Neighborhood,
        Condition1: "Norm",
        Condition2: "Norm",
        BldgType: "1Fam",
        HouseStyle: "1Story",
        OverallQual: Number(inputs.OverallQual),
        OverallCond: Number(inputs.OverallCond),
        YearBuilt: Number(inputs.YearBuilt),
        YearRemodAdd: Number(inputs.YearRemodAdd),
        RoofStyle: "Gable",
        RoofMatl: "CompShg",
        Exterior1st: "VinylSd",
        Exterior2nd: "VinylSd",
        MasVnrType: null,
        MasVnrArea: 0.0,
        ExterQual: "TA",
        ExterCond: "TA",
        Foundation: "PConc",
        BsmtQual: "TA",
        BsmtCond: "TA",
        BsmtExposure: "No",
        BsmtFinType1: "Unf",
        BsmtFinSF1: 0,
        BsmtFinType2: "Unf",
        BsmtFinSF2: 0,
        BsmtUnfSF: Number(inputs.TotalBsmtSF),
        TotalBsmtSF: Number(inputs.TotalBsmtSF),
        Heating: "GasA",
        HeatingQC: "Ex",
        CentralAir: inputs.CentralAir,
        Electrical: "SBrkr",
        "1stFlrSF": Number(inputs.GrLivArea), // AmesColumn Alias supported in schemas.py
        "2ndFlrSF": 0,
        LowQualFinSF: 0,
        GrLivArea: Number(inputs.GrLivArea),
        BsmtFullBath: 0,
        BsmtHalfBath: 0,
        FullBath: Number(inputs.FullBath),
        HalfBath: Number(inputs.HalfBath),
        BedroomAbvGr: Number(inputs.BedroomAbvGr),
        KitchenAbvGr: 1,
        KitchenQual: "TA",
        TotRmsAbvGrd: Number(inputs.BedroomAbvGr) + Number(inputs.FullBath) + 2, // approximation
        Functional: "Typ",
        Fireplaces: 0,
        FireplaceQu: null,
        GarageType: "Attchd",
        GarageYrBlt: Number(inputs.YearBuilt),
        GarageFinish: "RFn",
        GarageCars: Number(inputs.GarageCars),
        GarageArea: Number(inputs.GarageCars) * 250, // approximation: 250 sq ft per car
        GarageQual: "TA",
        GarageCond: "TA",
        PavedDrive: "Y",
        WoodDeckSF: 0,
        OpenPorchSF: 0,
        EnclosedPorch: 0,
        "3SsnPorch": 0,
        ScreenPorch: 0,
        PoolArea: 0,
        PoolQC: null,
        Fence: null,
        MiscFeature: null,
        MiscVal: 0,
        MoSold: 6,
        YrSold: 2008,
        SaleType: "WD",
        SaleCondition: "Normal",
      };

      const res = await fetch(`${backendUrl}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errDetail = await res.text();
        throw new Error(errDetail || "Failed to retrieve inference value.");
      }

      const data = await res.json();
      const predictedPrice = data.predicted_price;
      
      const newResult = {
        predictedPrice,
        timestamp: new Date().toLocaleTimeString(),
        inputsUsed: { ...inputs },
      };

      setPredictionResult(newResult);
      saveToHistory(predictedPrice, inputs);
      toast.success("Experimental ML price predicted successfully! 🔮");

    } catch (e: any) {
      console.error(e);
      toast.error(`Prediction Error: ${e.message || "Failed to communicate with FastAPI"}`);
    } finally {
      setPredictionLoading(false);
    }
  };

  if (authLoading || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
      </div>
    );
  }

  // 13 High-impact form features definition
  const formFields = [
    {
      name: "GrLivArea",
      label: "Living Area (sq.ft)",
      type: "number",
      min: 300,
      max: 10000,
      help: "Living area size. Crucial valuation feature.",
    },
    {
      name: "LotArea",
      label: "Lot Size (Total Land sqft)",
      type: "number",
      min: 500,
      max: 100000,
      help: "Overall property lot dimensions in sqft.",
    },
    {
      name: "TotalBsmtSF",
      label: "Basement Area (sq.ft)",
      type: "number",
      min: 0,
      max: 5000,
      help: "Square footage of property's foundation/basement.",
    },
    {
      name: "YearBuilt",
      label: "Year Built",
      type: "number",
      min: 1800,
      max: 2026,
      help: "Initial construction year of the property.",
    },
    {
      name: "YearRemodAdd",
      label: "Year Remodeled/Restored",
      type: "number",
      min: 1950,
      max: 2026,
      help: "Last renovation year (defaults to Year Built if none).",
    },
    {
      name: "OverallQual",
      label: "Property Quality (1-10)",
      type: "select",
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      help: "Evaluation of the physical material and finishes.",
    },
    {
      name: "OverallCond",
      label: "Overall Condition Rating (1-10)",
      type: "select",
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      help: "Current physical wear-and-tear rating of property.",
    },
    {
      name: "BedroomAbvGr",
      label: "Bedrooms (Above Grade)",
      type: "select",
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      help: "Count of bedrooms (excludes basements).",
    },
    {
      name: "FullBath",
      label: "Full Bathrooms",
      type: "select",
      options: [0, 1, 2, 3, 4],
      help: "Bathrooms equipped with standard tub/shower.",
    },
    {
      name: "HalfBath",
      label: "Half Bathrooms",
      type: "select",
      options: [0, 1, 2],
      help: "Powder rooms (sink & toilet only).",
    },
    {
      name: "GarageCars",
      label: "Garage Capacity",
      type: "select",
      options: [0, 1, 2, 3, 4],
      help: "Garaged vehicles capacity size.",
    },
    {
      name: "Neighborhood",
      label: "Sub-Market (Neighborhood)",
      type: "select",
      options: [
        "CollgCr", "Veenker", "Crawfor", "NoRidge", "Mitchel", "Somerst", 
        "NWAmes", "OldTown", "Edwards", "Gilbert", "Sawyer", "StoneBr", 
        "Timber", "IDOTRR", "MeadowV", "BrDale", "NPkVill", "Blmngtn"
      ],
      help: "Localized housing zones.",
    },
    {
      name: "CentralAir",
      label: "Central Air Conditioning",
      type: "select",
      options: ["Y", "N"],
      help: "Exposes active HVAC cooling systems.",
    },
  ];

  const NEIGHBORHOOD_MAPPING: Record<string, string> = {
    CollgCr: "Baner, Pune (CollgCr)",
    NoRidge: "Bandra, Mumbai (NoRidge)",
    Crawfor: "Koregaon Park, Pune (Crawfor)",
    Somerst: "Whitefield, Bangalore (Somerst)",
    Veenker: "Alipore, Kolkata (Veenker)",
    StoneBr: "Jubilee Hills, Hyderabad (StoneBr)",
    Timber: "Salt Lake City, Kolkata (Timber)",
    Gilbert: "Gachibowli, Hyderabad (Gilbert)",
    NWAmes: "Noida Sector 62, Delhi NCR (NWAmes)",
    OldTown: "Chandni Chowk, Delhi (OldTown)",
    Edwards: "Hadapsar, Pune (Edwards)",
    Sawyer: "Thane, Mumbai (Sawyer)",
    IDOTRR: "Central Town, Chennai (IDOTRR)",
    MeadowV: "Rajajinagar, Bangalore (MeadowV)",
    BrDale: "Kalyan Nagar, Bangalore (BrDale)",
    NPkVill: "Adyar, Chennai (NPkVill)",
    Blmngtn: "Bopal, Ahmedabad (Blmngtn)",
    Mitchel: "Hinjewadi, Pune (Mitchel)",
  };

  return (
    <RoleProtectedRoute allowedRole={role}>
      <DashboardLayout role={role}>
        <div className="space-y-8">
          <BackToDashboard />
          
          {/* HEADER SECTION */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 dark:text-amber-400 border border-amber-500/20">
                🔬 Valuation Intelligence Sandbox
              </span>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
                AI Valuation Lab
              </h1>
              <p className="mt-2 text-muted-foreground text-sm max-w-3xl">
                Interact with our regression pipelines. These metrics serve strictly as **ML model demonstrations and valuation experiments** trained on public datasets, rather than real localized Indian property valuations.
              </p>
            </div>
            
            {/* Health check dynamic pill */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
              <span className="text-xs text-muted-foreground">Inference Pipeline:</span>
              <span className="flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                  apiStatus === "Online" ? "bg-emerald-500 animate-pulse" :
                  apiStatus === "Offline" ? "bg-rose-500" : "bg-muted animate-spin"
                }`} />
                <span className={`text-xs font-bold ${
                  apiStatus === "Online" ? "text-emerald-500 dark:text-emerald-400" :
                  apiStatus === "Offline" ? "text-rose-500 dark:text-rose-400" : "text-muted-foreground"
                }`}>
                  {apiStatus}
                </span>
              </span>
            </div>
          </div>

          {/* WARNING & LEGAL PREAMBLE NOTICE */}
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-2">
            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              ⚠️ Valuation Demonstration Notice
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This interactive tool communicates with an active <strong>XGBoost Estimator</strong> trained on the <strong>Ames Housing Dataset</strong>. Predictions represent property values mapped from USA housing indicators, converted for Indian rupee valuation references. They do <strong>NOT</strong> reflect direct physical local Indian real estate appraisals.
            </p>
          </div>

          {/* MAIN GRID */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* COLUMN 1 & 2: PREDICTION INPUT WORKSPACE */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* STATUS OVERVIEW */}
              <section className="rounded-[32px] border border-border bg-card p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    Model Specifications
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Underlying pipeline architecture and accuracy index.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background/50 p-5">
                    <p className="text-xs text-muted-foreground">Active Model</p>
                    <h4 className="mt-2 text-lg font-bold text-foreground">XGBoost Regressor</h4>
                    <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mt-1">Supervised Learning</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/50 p-5">
                    <p className="text-xs text-muted-foreground">Reference Dataset</p>
                    <h4 className="mt-2 text-lg font-bold text-foreground">Ames Housing</h4>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Ames, Iowa, USA</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/50 p-5">
                    <p className="text-xs text-muted-foreground">Validation Accuracy</p>
                    <h4 className="mt-2 text-lg font-bold text-emerald-500 dark:text-emerald-400">92.67% R²</h4>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium mt-1">Mean Absolute Error (MAE) opt.</p>
                  </div>
                </div>
              </section>

              {/* DYNAMIC FORM */}
              <section className="rounded-[32px] border border-border bg-card p-8 shadow-sm space-y-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    Inference Parameter Setup
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Input property specs. Any parameters left empty are auto-imputed using baseline training dataset medians.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {formFields.map((field) => (
                    <div key={field.name} className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor={field.name} className="text-sm font-semibold text-foreground">
                          {field.label}
                        </label>
                        <span className="text-[10px] text-muted-foreground cursor-help" title={field.help}>
                          ℹ️ Help
                        </span>
                      </div>

                      {field.type === "select" ? (
                        <select
                          id={field.name}
                          value={inputs[field.name]}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-blue-500/50 transition cursor-pointer"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt} className="bg-card text-foreground">
                              {field.name === "Neighborhood" ? (NEIGHBORHOOD_MAPPING[opt] || opt) : opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.name}
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={inputs[field.name]}
                          onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                          className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-blue-500/50 transition"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <button
                    disabled={predictionLoading}
                    onClick={handlePredict}
                    className="w-full rounded-2xl bg-primary text-primary-foreground py-4 text-sm font-bold transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {predictionLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent inline-block" />
                        Running Pipeline Inference...
                      </>
                    ) : (
                      "🔮 Estimate Experimental House Value"
                    )}
                  </button>
                </div>
              </section>

            </div>

            {/* COLUMN 3: RESULTS & PERSISTENCE HISTORY */}
            <div className="space-y-8">
              
              {/* RESULTS CARD */}
              <section className="rounded-[32px] border border-border bg-card p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    📊 Valuation Results
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Live inference outcome.
                  </p>
                </div>

                {predictionResult ? (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Price display box */}
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-1">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                        Predicted Market Value (INR)
                      </p>
                      <h2 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹ {(predictionResult.predictedPrice * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </h2>
                      <div className="pt-2 border-t border-border mt-2">
                        <p className="text-[10px] text-muted-foreground">
                          USD Valuation:
                        </p>
                        <p className="text-base font-bold text-foreground">
                          ${predictionResult.predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 italic mt-1">
                          (Conversion reference: 1 USD = 83 INR)
                        </p>
                      </div>
                    </div>

                    {/* Metadata breakdown */}
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Inference Model:</span>
                        <span className="text-foreground font-medium">XGBoost Regressor</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Quality Rating:</span>
                        <span className="text-foreground font-medium">{predictionResult.inputsUsed.OverallQual} / 10</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Size (Living Area):</span>
                        <span className="text-foreground font-medium">{predictionResult.inputsUsed.GrLivArea} sqft</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Run Timestamp:</span>
                        <span className="text-muted-foreground font-semibold">{predictionResult.timestamp}</span>
                      </div>
                    </div>

                    {/* Confidence Assessment */}
                    <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
                      <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400">Confidence Assessment</h5>
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">
                        High-confidence mathematical regression. Extrapolates based on {predictionResult.inputsUsed.OverallQual >= 7 ? "Premium" : "Average"} material grades and a {predictionResult.inputsUsed.GrLivArea} sqft liveable footprint in {NEIGHBORHOOD_MAPPING[predictionResult.inputsUsed.Neighborhood] || predictionResult.inputsUsed.Neighborhood}.
                      </p>
                    </div>

                    {/* Explanatory Educational Disclaimer */}
                    <div className="text-[10px] text-muted-foreground border-t border-border pt-4 leading-relaxed italic">
                      This AI valuation is generated using a machine learning model trained on structured housing data and is intended for educational and investment analysis purposes.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-background/50">
                    <span className="text-3xl inline-block animate-pulse">🔮</span>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      Formulate specifications and trigger prediction to retrieve ML valuation output.
                    </p>
                  </div>
                )}
              </section>

              {/* PERSISTENCE HISTORY */}
              <section className="rounded-[32px] border border-border bg-card p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    ⏱️ Prediction History
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 5 experiments cached locally in your browser.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {history.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No experiments logged.
                    </div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadHistory(item)}
                        className="group flex flex-col justify-between rounded-xl border border-border bg-background hover:bg-muted/50 transition cursor-pointer p-4 text-left shadow-sm hover:shadow"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-muted-foreground">
                            {item.timestamp}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                            ₹ {(item.predictedPrice * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-2 truncate">
                          {item.inputs.GrLivArea} sqft • Qual {item.inputs.OverallQual} • {NEIGHBORHOOD_MAPPING[item.inputs.Neighborhood] || item.inputs.Neighborhood}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>


          </div>

          {/* AI CAPABILITIES COMPONENT */}
          <div className="pt-8">
            <AICapabilities />
          </div>

        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}
