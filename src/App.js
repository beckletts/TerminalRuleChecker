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
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    color: colors.accent.midnightBlue,
    marginBottom: "5px",
    fontWeight: "500",
  },
  select: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: `1px solid ${colors.neutral.mist}`,
    marginBottom: "10px",
  },
  componentCard: {
    backgroundColor: colors.neutral.white,
    border: `1px solid ${colors.neutral.mist}`,
    borderRadius: "4px",
    padding: "15px",
    marginBottom: "15px",
  },
  checkbox: {
    marginRight: "8px",
  },
  dateInput: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: `1px solid ${colors.neutral.mist}`,
    marginTop: "5px",
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
  const [formData, setFormData] = useState({
    currentSeries: "",
    currentYear: "",
    components: {
      1: { completed: false, date: "" },
      2: { completed: false, date: "" },
      3: { completed: false, date: "" },
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComponentChange = (componentId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [componentId]: {
          ...prev.components[componentId],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>BTEC Tech Awards Eligibility Checker</h1>
      </div>

      <div style={styles.alert}>
        <h3 style={{ margin: "0 0 10px 0", color: colors.accent.midnightBlue }}>
          Key Rules
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={styles.formGroup}>
            <label style={styles.label}>Current Series</label>
            <select
              name="currentSeries"
              value={formData.currentSeries}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Select Series</option>
              <option value="decjan">December/January</option>
              <option value="mayjun">May/June</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Year</label>
            <select
              name="currentYear"
              value={formData.currentYear}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Select Year</option>
              <option value="year1">Year 1</option>
              <option value="year2">Year 2</option>
            </select>
          </div>
        </div>

        {[1, 2, 3].map((componentId) => (
          <div key={componentId} style={styles.componentCard}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: colors.accent.midnightBlue,
              }}
            >
              Component {componentId}{" "}
              {componentId === 3 ? "(External)" : "(Internal)"}
            </h3>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={formData.components[componentId].completed}
                  onChange={(e) =>
                    handleComponentChange(
                      componentId,
                      "completed",
                      e.target.checked
                    )
                  }
                  style={styles.checkbox}
                />
                Completed
              </label>
            </div>

            {formData.components[componentId].completed && (
              <div>
                <label style={styles.label}>Completion Date</label>
                <input
                  type="date"
                  value={formData.components[componentId].date}
                  onChange={(e) =>
                    handleComponentChange(componentId, "date", e.target.value)
                  }
                  style={styles.dateInput}
                />
              </div>
            )}
          </div>
        ))}

        <div style={styles.statusAlert("success")}>
          <h3
            style={{ margin: "0 0 5px 0", color: colors.accent.midnightBlue }}
          >
            Eligible for Certification
          </h3>
          <p style={{ margin: 0, color: colors.neutral.graphite }}>
            All requirements have been met.
          </p>
        </div>

        <div style={styles.statusAlert("error")}>
          <h3
            style={{ margin: "0 0 5px 0", color: colors.accent.midnightBlue }}
          >
            Not Eligible
          </h3>
          <p style={{ margin: 0, color: colors.neutral.graphite }}>
            Internal components must be completed before or in the same series
            as the external assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecker;
