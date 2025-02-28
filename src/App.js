import React, { useState, useEffect } from "react";

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
  button: {
    backgroundColor: colors.accent.midnightBlue,
    color: colors.neutral.white,
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "15px",
    fontWeight: "bold",
  },
};

const EligibilityChecker = () => {
  const sessions = ["Dec/Jan Y1", "May/June Y1", "Dec/Jan Y2", "May/June Y2"];

  const [selectedComponents, setSelectedComponents] = useState({
    "Dec/Jan Y1": { component: "", resit: "" },
    "May/June Y1": { component: "", resit: "" },
    "Dec/Jan Y2": { component: "", resit: "" },
    "May/June Y2": { component: "", resit: "" },
  });

  const [eligibilityStatus, setEligibilityStatus] = useState({
    isEligible: false,
    message: "Please select components",
    details: [],
  });

  const handleComponentChange = (session, component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [session]: { ...prev[session], component },
    }));
  };

  const handleResitChange = (session, component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [session]: { ...prev[session], resit: component },
    }));
  };

  // This checks if a component or resit is an internal component
  const isInternalComponent = (componentValue) => {
    return (
      componentValue?.startsWith("comp1") || componentValue?.startsWith("comp2")
    );
  };

  // This checks if a component or resit is an external component
  const isExternalComponent = (componentValue) => {
    return componentValue?.startsWith("comp3");
  };

  const validateEligibility = () => {
    // Reset status
    const details = [];
    let isEligible = true;

    // 1. Get all selected components and resits
    const allSelections = Object.entries(selectedComponents).filter(
      ([_, value]) => value.component || value.resit
    );

    // Check if any components are selected
    if (allSelections.length === 0) {
      setEligibilityStatus({
        isEligible: false,
        message: "Please select at least one component",
        details: [],
      });
      return;
    }

    // 2. Find the latest external assessment (Component 3)
    const externalAssessments = Object.entries(selectedComponents)
      .filter(
        ([_, value]) =>
          value.component === "comp3" || value.resit === "comp3_resit"
      )
      .sort((a, b) => sessions.indexOf(b[0]) - sessions.indexOf(a[0]));

    if (externalAssessments.length === 0) {
      setEligibilityStatus({
        isEligible: false,
        message: "External assessment (Component 3) must be completed",
        details: ["External assessment is required for certification"],
      });
      return;
    }

    // Get the final external assessment
    const [terminalExternalSession] = externalAssessments[0];
    const terminalExternalIndex = sessions.indexOf(terminalExternalSession);

    // 3. Check for internal components completed after the terminal external
    const lateInternalComponents = Object.entries(selectedComponents)
      .filter(([session, value]) => {
        const sessionIndex = sessions.indexOf(session);
        return (
          sessionIndex > terminalExternalIndex &&
          (isInternalComponent(value.component) ||
            isInternalComponent(value.resit))
        );
      })
      .map(([session]) => session);

    // 4. For any internal component after the terminal external, check if there's a corresponding external resit
    if (lateInternalComponents.length > 0) {
      // Find the latest of these late internal components
      const latestInternalIndex = Math.max(
        ...lateInternalComponents.map((session) => sessions.indexOf(session))
      );
      const latestInternalSession = sessions[latestInternalIndex];

      // Check if there's an external assessment in the same series as the latest internal
      const hasExternalInSameSeries = 
        isExternalComponent(selectedComponents[latestInternalSession].component) ||
        isExternalComponent(selectedComponents[latestInternalSession].resit);

      // Check if there's an external assessment after the latest internal
      const hasLaterExternal = Object.entries(selectedComponents).some(
        ([session, value]) => {
          const sessionIndex = sessions.indexOf(session);
          return (
            sessionIndex > latestInternalIndex &&
            (isExternalComponent(value.component) ||
              isExternalComponent(value.resit))
          );
        }
      );

      if (!hasExternalInSameSeries && !hasLaterExternal) {
        isEligible = false;
        details.push(
          `Internal component(s) in ${lateInternalComponents.join(
            ", "
          )} require an external resit in the same or later series`
        );
      }
    }

    // 5. Check for duplicate components (excluding resits)
    const componentCounts = {};
    Object.values(selectedComponents).forEach((value) => {
      if (value.component) {
        componentCounts[value.component] = (componentCounts[value.component] || 0) + 1;
      }
    });

    // 6. Check for too many resits
    const resitCounts = {
      comp1_resit: 0,
      comp2_resit: 0,
      comp3_resit: 0,
    };

    Object.values(selectedComponents).forEach((value) => {
      if (value.resit) {
        resitCounts[value.resit] = (resitCounts[value.resit] || 0) + 1;
      }
    });

    Object.entries(resitCounts).forEach(([resit, count]) => {
      if (count > 1) {
        isEligible = false;
        details.push(`Only one resit allowed for ${resit.split("_")[0]}`);
      }
    });

    // 7. Check if all components (1, 2, and 3) are present
    const hasComp1 = Object.values(selectedComponents).some(
      (value) => value.component === "comp1" || value.resit === "comp1_resit"
    );
    const hasComp2 = Object.values(selectedComponents).some(
      (value) => value.component === "comp2" || value.resit === "comp2_resit"
    );
    const hasComp3 = Object.values(selectedComponents).some(
      (value) => value.component === "comp3" || value.resit === "comp3_resit"
    );

    if (!hasComp1 || !hasComp2 || !hasComp3) {
      isEligible = false;
      details.push("All three components must be completed");
    }

    // Set final status
    setEligibilityStatus({
      isEligible,
      message: isEligible
        ? "All requirements have been met"
        : "Some requirements have not been met",
      details,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>BTEC Tech Awards Eligibility Checker</h1>
      </div>

      <div style={styles.alert}>
        <h3 style={{ margin: "0 0 10px 0", color: colors.accent.midnightBlue }}>
          Terminal Rule & Instructions
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            color: colors.neutral.graphite,
          }}
        >
          <li>
            <strong>Terminal Rule:</strong> Learners must take the external assessment at the 
            end of their qualification (the series in which they certificate)
          </li>
          <li>
            Internal components must be completed before or in the same series
            as the external assessment
          </li>
          <li>
            If a learner retakes an internal component after the terminal external,
            they must also resit the external assessment
          </li>
          <li>One retake allowed per internal component</li>
          <li>One external assessment resit allowed</li>
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
                      {comp} {index === 2 ? "(External)" : "(Internal)"}
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

        <button onClick={validateEligibility} style={styles.button}>
          Check Eligibility
        </button>

        {/* Status message */}
        {(eligibilityStatus.message !== "Please select components" || eligibilityStatus.details.length > 0) && (
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
                : "Not Eligible for Certification"}
            </h3>
            <p style={{ margin: "0 0 10px 0", color: colors.neutral.graphite }}>
              {eligibilityStatus.message}
            </p>
            
            {eligibilityStatus.details.length > 0 && (
              <div>
                <h4 style={{ margin: "10px 0 5px 0", color: colors.accent.midnightBlue }}>
                  Details:
                </h4>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {eligibilityStatus.details.map((detail, index) => (
                    <li key={index} style={{ color: colors.neutral.graphite }}>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibilityChecker;
