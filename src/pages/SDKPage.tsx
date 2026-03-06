import React from 'react';

const SDKPage: React.FC = () => {
  return (
    <div className="sdk-container">
      <div className="page-header">
        <h1 className="page-title">iOS SDK</h1>
        <p className="page-description">
          Integrate AutoEdge into your iOS app for OTA model delivery.
        </p>
      </div>

      <div>
        <section className="sdk-section">
          <h2 className="sdk-section-title">Installation</h2>
          <p className="sdk-section-text">
            Add the AutoEdge SDK to your project using Swift Package Manager.
          </p>

          <div className="sdk-code-block">
            <pre>{`// In Xcode: File > Add Package Dependencies
// Enter the repository URL:
https://github.com/your-org/autoedge-ios-sdk

// Or add to Package.swift:
dependencies: [
    .package(url: "https://github.com/your-org/autoedge-ios-sdk", from: "1.0.0")
]`}</pre>
          </div>
        </section>

        <section className="sdk-section">
          <h2 className="sdk-section-title">Quick Start</h2>

          <div className="sdk-code-block">
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

        <section className="sdk-section">
          <h2 className="sdk-section-title">API Reference</h2>

          <div className="sdk-api-list">
            <div className="sdk-api-item">
              <h3 className="sdk-api-name">
                <code>configure(serverURL:)</code>
              </h3>
              <p className="sdk-api-description">
                Initialize the SDK with your server URL. Call once on app launch.
              </p>
            </div>

            <div className="sdk-api-item">
              <h3 className="sdk-api-name">
                <code>loadModel(modelId:)</code>
              </h3>
              <p className="sdk-api-description">
                Load a model by ID. Downloads if needed, returns cached version if up-to-date.
              </p>
            </div>

            <div className="sdk-api-item">
              <h3 className="sdk-api-name">
                <code>checkForUpdate(modelId:)</code>
              </h3>
              <p className="sdk-api-description">
                Check if a newer version is available. Returns update info or nil.
              </p>
            </div>

            <div className="sdk-api-item">
              <h3 className="sdk-api-name">
                <code>reportInference(modelId:latencyMs:)</code>
              </h3>
              <p className="sdk-api-description">
                Report inference metrics. Events are batched and sent periodically.
              </p>
            </div>

            <div className="sdk-api-item">
              <h3 className="sdk-api-name">
                <code>clearCache(modelId:)</code>
              </h3>
              <p className="sdk-api-description">
                Clear cached models. Pass nil to clear all, or a specific model ID.
              </p>
            </div>
          </div>
        </section>

        <section className="sdk-section">
          <h2 className="sdk-section-title">Error Handling</h2>

          <div className="sdk-code-block">
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
