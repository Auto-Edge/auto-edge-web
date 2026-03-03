import React from 'react';

const SDKPage: React.FC = () => {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">iOS SDK</h1>
        <p className="text-slate-400 text-sm">
          Integrate AutoEdge into your iOS app for OTA model delivery.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Installation</h2>
          <p className="text-slate-400 text-sm mb-4">
            Add the AutoEdge SDK to your project using Swift Package Manager.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>{`// In Xcode: File > Add Package Dependencies
// Enter the repository URL:
https://github.com/your-org/autoedge-ios-sdk

// Or add to Package.swift:
dependencies: [
    .package(url: "https://github.com/your-org/autoedge-ios-sdk", from: "1.0.0")
]`}</pre>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>{`import AutoEdgeSDK

// Configure on app launch
AutoEdgeSDK.shared.configure(
    serverURL: URL(string: "https://your-server.com")!
)

// Load a model
let modelURL = try await AutoEdgeSDK.shared.loadModel(
    modelId: "my-model"
)

// Use with Core ML
let model = try MLModel(contentsOf: modelURL)

// Report inference metrics
AutoEdgeSDK.shared.reportInference(
    modelId: "my-model",
    latencyMs: 15.5
)`}</pre>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">API Reference</h2>

          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-medium text-white mb-2">
                <code className="text-blue-400">configure(serverURL:)</code>
              </h3>
              <p className="text-slate-400 text-sm">
                Initialize the SDK with your server URL. Call once on app launch.
              </p>
            </div>

            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-medium text-white mb-2">
                <code className="text-blue-400">loadModel(modelId:)</code>
              </h3>
              <p className="text-slate-400 text-sm">
                Load a model by ID. Downloads if needed, returns cached version if up-to-date.
              </p>
            </div>

            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-medium text-white mb-2">
                <code className="text-blue-400">checkForUpdate(modelId:)</code>
              </h3>
              <p className="text-slate-400 text-sm">
                Check if a newer version is available. Returns update info or nil.
              </p>
            </div>

            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-medium text-white mb-2">
                <code className="text-blue-400">reportInference(modelId:latencyMs:)</code>
              </h3>
              <p className="text-slate-400 text-sm">
                Report inference metrics. Events are batched and sent periodically.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">
                <code className="text-blue-400">clearCache(modelId:)</code>
              </h3>
              <p className="text-slate-400 text-sm">
                Clear cached models. Pass nil to clear all, or a specific model ID.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Error Handling</h2>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>{`do {
    let modelURL = try await AutoEdgeSDK.shared.loadModel(
        modelId: "my-model"
    )
} catch AutoEdgeError.notConfigured {
    print("SDK not configured")
} catch AutoEdgeError.networkError(let error) {
    print("Network error: \\(error)")
} catch AutoEdgeError.modelNotFound(let modelId) {
    print("Model not found: \\(modelId)")
} catch {
    print("Unknown error: \\(error)")
}`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SDKPage;
