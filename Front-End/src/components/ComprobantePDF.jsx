import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'; 
import logoUrl from '../assets/logojavapdf.png';

// --- INICIO: FUNCIONES HELPER ---
// Funciones para formatear la fecha y hora desde el string ISO
const formatFecha = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        // Usamos timeZone: 'UTC' para que no mueva la fecha al convertir
        return new Date(isoString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
    } catch (e) { //eslint-disable-line no-unused-vars
        return 'Fecha inválida';
    }
};

const formatHora = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        // Extraer solo la hora: HH:MM
        const date = new Date(isoString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (e) { //eslint-disable-line no-unused-vars
        return 'Hora inválida';
    }
};

const getNombreCompleto = (obj) => {
    if (!obj) return 'N/A';
    return `${obj.nombre || ''} ${obj.apellido || ''}`.trim() || 'N/A';
};
// --- FIN HELPERS ---

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
    alignItems: 'center', 
    marginBottom: 25,
  },
  logo: {
    width: 150, 
    height: 'auto', 
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#111827', 
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#6B7280', 
    marginBottom: 25,
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
  footerText: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280', 
    borderTop: '1pt solid #E5E7EB', 
    paddingTop: 10,
  },
  smallText: {
    fontSize: 9,
    marginTop: 15,
    textAlign: 'center',
    color: '#4B5563', 
  }
});

// --- El componente que define el PDF ---
const ComprobantePDF = ({ turno }) => {
  // --- CORRECCIÓN: Usar los helpers y los datos anidados ---
  const fechaStr = formatFecha(turno.fecha_hora);
  const horaStr = formatHora(turno.fecha_hora);
  const profesionalStr = getNombreCompleto(turno.medico);
  const especialidadStr = turno.medico?.especialidad || 'N/A';
  const consultorioStr = turno.consultorio?.numero || 'N/A';
  // --- FIN CORRECCIÓN ---

  const fechaCreacionStr = turno.fecha_creacion
    ? new Date(turno.fecha_creacion).toLocaleString('es-AR')
    : 'N/A';

  return (
    <Document title={`Comprobante Turno ${turno.id}`}>
      <Page size="A4" style={styles.page}>

        {/* Encabezado con Logo y Título */}
        <View style={styles.headerSection}>
          <Image style={styles.logo} src={logoUrl} />
          <Text style={styles.title}>Comprobante de Turno Médico</Text>
          <Text style={styles.subtitle}>Centro de Salud JAVA</Text>
        </View>

        {/* Recuadro Datos del Paciente */}
        <View style={styles.infoBox}>
          <Text style={styles.boxTitle}>Información del Paciente</Text>
          <View style={styles.textRow}>
            <Text style={styles.label}>Paciente:</Text>
            <Text style={styles.textValue}>{turno.cliente_nombre_completo || 'N/A'}</Text>
          </View>
        </View>

        {/* Recuadro Detalles del Turno (CORREGIDO) */}
        <View style={styles.infoBox}>
          <Text style={styles.boxTitle}>Detalles de la Cita (Turno ID: {turno.id})</Text>
          <View style={styles.textRow}>
            <Text style={styles.label}>Especialidad:</Text>
            <Text style={styles.textValue}>{especialidadStr}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Profesional:</Text>
            <Text style={styles.textValue}>{profesionalStr}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.textValue}>{fechaStr}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Hora:</Text>
            <Text style={styles.textValue}>{horaStr}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Consultorio:</Text>
            <Text style={styles.textValue}>{consultorioStr}</Text>
          </View>
          {turno.motivo && (
            <View style={styles.textRow}>
              <Text style={styles.label}>Motivo:</Text>
              <Text style={styles.textValue}>{turno.motivo}</Text>
            </View>
          )}
        </View>

        {/* Indicaciones */}
        <Text style={styles.smallText}>
            Recuerde presentarse 10 minutos antes del horario indicado.
        </Text>
         <Text style={styles.smallText}>
            Si necesita cancelar el turno, por favor hágalo con la mayor anticipación posible.
        </Text>

        {/* Pie de Página */}
        <Text style={styles.footerText}>
          Comprobante generado el: {new Date().toLocaleString('es-AR')} | Turno solicitado el: {fechaCreacionStr}
        </Text>
      </Page>
    </Document>
  );
};

export default ComprobantePDF;