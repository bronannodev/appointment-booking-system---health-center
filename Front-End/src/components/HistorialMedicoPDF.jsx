import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'; 
import logoUrl from '../assets/logojavapdf.png'; // Reutiliza el logo

// --- Define los estilos para el PDF ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerText: {
    textAlign: 'right',
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  reportTitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textDecoration: 'underline',
  },
  infoBox: {
    border: '1pt solid #D1D5DB',
    borderRadius: 3,
    padding: 12,
    marginBottom: 15,
  },
  boxTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E40AF',
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    marginRight: 5,
  },
  textValue: {
    width: '70%',
  },
  notesSection: {
    marginTop: 20,
    borderTop: '1pt solid #EEE',
    paddingTop: 10,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesContent: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: '#4B5563',
  },
  footerText: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 10,
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },
});

// --- El componente que define el PDF ---
const HistorialMedicoPDF = ({ turno, paciente, medico }) => {
  const fechaStr = turno.fecha_turno
    ? new Date(turno.fecha_turno + 'T00:00:00').toLocaleDateString('es-AR')
    : 'N/A';
  const horaStr = turno.hora_turno || 'N/A';
  const fechaGeneracion = new Date().toLocaleString('es-AR');

  return (
    <Document title={`Historial Turno ${turno.id}`}>
      <Page size="A4" style={styles.page}>

        {/* Encabezado */}
        <View style={styles.headerSection}>
          <Image style={styles.logo} src={logoUrl} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Centro de Salud JAVA</Text>
            <Text style={styles.subtitle}>Reporte de Historial Médico</Text>
            <Text style={styles.subtitle}>Generado: {fechaGeneracion}</Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>Detalle de Atención (Turno ID: {turno.id})</Text>

        {/* Recuadro Datos del Paciente */}
        <View style={styles.infoBox}>
          <Text style={styles.boxTitle}>Información del Paciente</Text>
          <View style={styles.textRow}>
            <Text style={styles.label}>Paciente:</Text>
            <Text style={styles.textValue}>{paciente.nombre} {paciente.apellido}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>DNI:</Text>
            <Text style={styles.textValue}>{paciente.dni}</Text>
          </View>
           <View style={styles.textRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.textValue}>{paciente.email}</Text>
          </View>
           <View style={styles.textRow}>
            <Text style={styles.label}>Fecha Nac.:</Text>
            <Text style={styles.textValue}>{new Date(paciente.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR')}</Text>
          </View>
        </View>

        {/* Recuadro Detalles del Turno */}
        <View style={styles.infoBox}>
          <Text style={styles.boxTitle}>Detalles de la Cita</Text>
          <View style={styles.textRow}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.textValue}>{fechaStr}</Text>
          </View>
           <View style={styles.textRow}>
            <Text style={styles.label}>Hora:</Text>
            <Text style={styles.textValue}>{horaStr}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.textValue}>{turno.estado.toUpperCase()}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Especialidad:</Text>
            <Text style={styles.textValue}>{turno.especialidad}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Profesional:</Text>
            <Text style={styles.textValue}>{medico.nombre} {medico.apellido}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Consultorio:</Text>
            <Text style={styles.textValue}>{turno.consultorio_numero} ({turno.consultorio_ubicacion})</Text>
          </View>
        </View>
        
        {/* Sección de Motivo y Notas */}
        <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Motivo de Consulta (registrado por paciente):</Text>
            <Text style={styles.notesContent}>
                {turno.motivo || 'No especificado.'}
            </Text>
        </View>

        <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notas del Profesional (CRUD):</Text>
            <Text style={styles.notesContent}>
                [Aquí irían las notas que el médico agregue. Esta función requiere un campo 'notas' en la BBDD y un endpoint PUT para guardarlas]
            </Text>
            <Text style={{...styles.notesContent, marginTop: 20}}>
                .............................................
            </Text>
             <Text style={{...styles.notesContent, marginTop: 5}}>
                Firma del Profesional
            </Text>
        </View>


        {/* Pie de Página */}
        <Text style={styles.footerText}>
          Este documento es confidencial y contiene información de salud sensible.
        </Text>
      </Page>
    </Document>
  );
};

export default HistorialMedicoPDF;