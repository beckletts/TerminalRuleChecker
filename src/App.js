import React, { useState } from "react";

// Color palette
const colors = {
  neutral: {
    white: "#FFFFFF",
    black: "#000000",
    mist: "#DFE1E1",
    graphite: "#505759",
  },
  accent: {
    brightOrange: "#FFBB1C",
    limeGreen: "#D2DB0E",
    skyBlue: "#94E7EA",
    coralPink: "#FF757A",
    freshGreen: "#84BD00",
    marineTurquoise: "#12B2A6",
    royalPurple: "#9E007E",
    grassGreen: "#008638",
    midnightBlue: "#003057",
  },
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: colors.accent.midnightBlue,
    color: colors.neutral.white,
    padding: "20px",
    borderRadius: "8px 8px 0 0",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: colors.neutral.white,
    border: `1px solid ${colors.neutral.mist}`,
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
  },
  alert: {
    padding: "15px",
    borderLeft: `4px solid ${colors.accent.marineTurquoise}`,
    backgroundColor: `${colors.accent.skyBlue}22`,
    marginBottom: "20px",
    borderRadius: "4px",
  },
  matrix: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    gap: "10px",
    marginTop: "20px",
  },
  sessionCell: {
    padding: "10px",
    backgroundColor: colors.neutral.mist,
    borderRadius: "4px",
    fontWeight: "500",
  },
  componentCell: {
    padding: "10px",
    border: `1px solid ${colors.neutral.mist}`,
    borderRadius: "4px",
  },
  dropdown: {
    width: "100%",
    padding: "8px",
    marginBottom: "5px",
    borderRadius: "4px",
    border: `1px solid ${colors.neutral.mist}`,
  },
  summaryCard: {
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "4px",
    border: `1px solid ${colors.neutral.mist}`,
  },
  statusAlert: (type) => ({
    padding: "15px",
    borderLeft: `4px solid ${
      type === "success" ? colors.accent.freshGreen : colors.accent.coralPink
    }`,
    backgroundColor:
      type === "success"
        ? `${colors.accent.limeGreen}22`
        : `${colors.accent.coralPink}22`,
    marginTop: "20px",
    borderRadius: "4px",
  }),
};

const EligibilityChecker = () => {
  const sessions = ["Dec/Jan Y1", "May/June Y1", "Dec/Jan Y2", "May/June Y2"];

  const [selectedComponents, setSelectedComponents] = useState({
    "Dec/Jan Y1": { component: "", resit: "" },
    "May/June Y1": { component: "", resit: "" },
    "Dec/Jan Y2": { component: "", resit: "" },
    "May/June Y2": { component: "", resit: "" },
  });

  const handleComponentChange = (session, component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [session]: { ...prev[session], component },
    }));
    validateEligibility();
  };

  const handleResitChange = (session, component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [session]: { ...prev[session], resit: component },
    }));
    validateEligibility();
  };

  const [eligibilityStatus, setEligibilityStatus] = useState({
    isEligible: false,
    message: "Please select components",
  });

  const validateEligibility = () => {
    // Get all selected components and resits
    const selections = Object.entries(selectedComponents).filter(
      ([_, value]) => value.component || value.resit
    );

    // Check if any components are selected
    if (selections.length === 0) {
      setEligibilityStatus({
        isEligible: false,
        message: "Please select at least one component",
      });
      return;
    }

    // Find external assessment (Component 3)
    const externalAssessment = Object.entries(selectedComponents).find(
      ([_, value]) =>
        value.component === "comp3" || value.resit === "comp3_resit"
    );

    if (!externalAssessment) {
      setEligibilityStatus({
        isEligible: false,
        message: "External assessment (Component 3) must be completed",
      });
      return;
    }

    // Check terminal rule
    const [externalSession, _] = externalAssessment;
    const externalIndex = sessions.indexOf(externalSession);

    const hasLateInternal = Object.entries(selectedComponents).some(
      ([session, value]) => {
        const sessionIndex = sessions.indexOf(session);
        return (
          sessionIndex > externalIndex &&
          (value.component?.startsWith("comp1") ||
            value.component?.startsWith("comp2") ||
            value.resit?.startsWith("comp1") ||
            value.resit?.startsWith("comp2"))
        );
      }
    );

    if (hasLateInternal) {
      setEligibilityStatus({
        isEligible: false,
        message:
          "Internal components must be completed before or in the same series as the external assessment",
      });
      return;
    }

    setEligibilityStatus({
      isEligible: true,
      message: "All requirements have been met",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>BTEC Tech Awards Eligibility Checker</h1>
      </div>

      <div style={styles.alert}>
        <h3 style={{ margin: "0 0 10px 0", color: colors.accent.midnightBlue }}>
          Rules & Instructions
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            color: colors.neutral.graphite,
          }}
        >
          <li>
            Internal components must be completed before or in the same series
            as the external assessment
          </li>
          <li>One retake allowed per internal component</li>
          <li>One external assessment resit allowed</li>
          <li>
            Internal resits after external assessment require an external resit
          </li>
        </ul>
      </div>

      <div style={styles.card}>
        <div style={styles.matrix}>
          {/* Header row */}
          <div style={{ fontWeight: "bold" }}>Session</div>
          <div style={{ fontWeight: "bold" }}>Component</div>

          {/* Session rows */}
          {sessions.map((session) => (
            <React.Fragment key={session}>
              <div style={styles.sessionCell}>{session}</div>
              <div style={styles.componentCell}>
                <select
                  style={styles.dropdown}
                  value={selectedComponents[session].component}
                  onChange={(e) =>
                    handleComponentChange(session, e.target.value)
                  }
                >
                  <option value="">Select Component</option>
                  <option value="comp1">Component 1 (Internal)</option>
                  <option value="comp2">Component 2 (Internal)</option>
                  <option value="comp3">Component 3 (External)</option>
                </select>

                {selectedComponents[session].component && (
                  <select
                    style={{ ...styles.dropdown, marginTop: "5px" }}
                    value={selectedComponents[session].resit}
                    onChange={(e) => handleResitChange(session, e.target.value)}
                  >
                    <option value="">Add Resit (Optional)</option>
                    <option value="comp1_resit">Component 1 Resit</option>
                    <option value="comp2_resit">Component 2 Resit</option>
                    <option value="comp3_resit">Component 3 Resit</option>
                  </select>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Component Summary */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: colors.neutral.mist,
            borderRadius: "4px",
          }}
        >
          <h3
            style={{ margin: "0 0 10px 0", color: colors.accent.midnightBlue }}
          >
            Component Status
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
            }}
          >
            {["Component 1", "Component 2", "Component 3"].map(
              (comp, index) => {
                const componentId = `comp${index + 1}`;
                const completedSession = Object.entries(
                  selectedComponents
                ).find(([_, value]) => value.component === componentId);
                const resitSession = Object.entries(selectedComponents).find(
                  ([_, value]) => value.resit === `${componentId}_resit`
                );

                return (
                  <div key={comp} style={styles.summaryCard}>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                      {comp}
                    </div>
                    <div>
                      Initial:{" "}
                      {completedSession ? completedSession[0] : "Not completed"}
                    </div>
                    <div>Resit: {resitSession ? resitSession[0] : "None"}</div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Status message */}
        <div
          style={styles.statusAlert(
            eligibilityStatus.isEligible ? "success" : "error"
          )}
        >
          <h3
            style={{ margin: "0 0 5px 0", color: colors.accent.midnightBlue }}
          >
            {eligibilityStatus.isEligible
              ? "Eligible for Certification"
              : "Not Eligible"}
          </h3>
          <p style={{ margin: 0, color: colors.neutral.graphite }}>
            {eligibilityStatus.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecker;
