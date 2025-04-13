// app/components/PDF/CurriculoPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface CurriculoPDFProps {
  fullName: string;
  email: string;
  experiences: { title: string; company: string; period: string }[];
  skills: string[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "bold",
  },
  text: {
    marginBottom: 4,
  },
});

const CurriculoPDF: React.FC<CurriculoPDFProps> = ({ fullName, email, experiences, skills }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>{fullName}</Text>
        <Text style={styles.text}>{email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Experiências</Text>
        {experiences.map((exp, i) => (
          <Text key={i} style={styles.text}>
            {exp.title} - {exp.company} ({exp.period})
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Skills</Text>
        <Text>{skills.join(", ")}</Text>
      </View>
    </Page>
  </Document>
);

export default CurriculoPDF;
