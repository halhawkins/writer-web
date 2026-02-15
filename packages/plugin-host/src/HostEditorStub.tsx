import React from "react";

export function HostEditorStub() {
  const [text, setText] = React.useState("Hello, editor stub.\n");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Editor (stub)</div>
      {/* <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1, width: "100%", resize: "none", backgroundColor: "purple" }}
        spellCheck={false}
      /> */}
    </div>
  );
}
