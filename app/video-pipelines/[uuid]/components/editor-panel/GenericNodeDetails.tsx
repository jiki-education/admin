import Section from "./Section";

interface GenericNodeDetailsProps {
  node: any; // Using any for now to match existing pattern
}

export default function GenericNodeDetails({ node }: GenericNodeDetailsProps) {
  return (
    <>
      {/* Inputs */}
      <Section title="Inputs">
        {Object.keys(node.inputs).length === 0 ? (
          <p className="text-sm text-gray-500">No inputs</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(node.inputs).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-semibold text-gray-700">{key}:</span>{" "}
                {Array.isArray(value) ? (
                  <div className="ml-4 mt-1 space-y-1">
                    {value.map((id, idx) => (
                      <div key={idx} className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {id}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">{value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Config */}
      <Section title="Configuration">
        {Object.keys(node.config).length === 0 ? (
          <p className="text-sm text-gray-500">No configuration</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(node.config).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-semibold text-gray-700">{key}:</span>{" "}
                <span className="text-gray-600">{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Asset (for asset nodes) */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {node.type === "asset" && node.asset != null && (
        <Section title="Asset">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Source:</span>{" "}
              <span className="text-gray-600 break-all">{node.asset.source}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Type:</span>{" "}
              <span className="text-gray-600">{node.asset.type}</span>
            </div>
          </div>
        </Section>
      )}

      {/* Metadata */}
      {node.metadata && Object.keys(node.metadata).length > 0 && (
        <Section title="Metadata">
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(node.metadata, null, 2)}
          </pre>
        </Section>
      )}

      {/* Output */}
      {node.output && Object.keys(node.output).length > 0 && (
        <Section title="Output">
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(node.output, null, 2)}
          </pre>
        </Section>
      )}
    </>
  );
}