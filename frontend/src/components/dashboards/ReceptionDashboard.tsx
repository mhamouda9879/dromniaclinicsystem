import React, { useState, useEffect } from 'react';
import { appointmentsApi, queueApi, patientsApi } from '../../services/api';
import { Appointment, AppointmentStatus, VisitType, Patient } from '../../types';
import { format } from 'date-fns';
import './Dashboard.css';

const ReceptionDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    fullName: '',
    phoneNumber: '',
    visitType: VisitType.GENERAL_GYNE,
    appointmentTime: '',
  });

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentsApi.getToday();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      await loadAppointments();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update appointment status');
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      await queueApi.markArrived(id);
      await loadAppointments();
    } catch (error) {
      console.error('Failed to mark as arrived', error);
      alert('Failed to mark as arrived');
    }
  };

  const handleEmergencyFlag = async (id: string) => {
    try {
      const appointment = appointments.find((a) => a.id === id);
      if (appointment) {
        await appointmentsApi.update(id, { emergencyFlag: !appointment.emergencyFlag });
        await loadAppointments();
      }
    } catch (error) {
      console.error('Failed to toggle emergency flag', error);
      alert('Failed to update emergency flag');
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create or find patient
      let patient: Patient | null = null;
      try {
        patient = await patientsApi.getByPhone(walkInForm.phoneNumber);
        console.log('Found existing patient:', patient);
      } catch (err: any) {
        // Patient doesn't exist, create new
        console.log('Patient not found, creating new. Status:', err.response?.status);
        if (err.response?.status === 404 || !err.response || err.message?.includes('not found')) {
          try {
            patient = await patientsApi.create({
              fullName: walkInForm.fullName,
              phoneNumber: walkInForm.phoneNumber,
              isReturningPatient: false,
            });
            console.log('Created new patient:', patient);
          } catch (createErr: any) {
            console.error('Failed to create patient:', createErr);
            throw new Error(`Failed to create patient: ${createErr.response?.data?.message || createErr.message}`);
          }
        } else {
          throw err;
        }
      }

      // Validate patient has an ID
      if (!patient) {
        throw new Error('Patient object is null or undefined');
      }
      
      if (!patient.id || typeof patient.id !== 'string') {
        console.error('Invalid patient object:', patient);
        throw new Error(`Patient ID is missing or invalid. Patient: ${JSON.stringify(patient)}`);
      }
      
      console.log('Using patient ID:', patient.id);

      // Convert time from 12-hour to 24-hour format if needed
      let appointmentTime = walkInForm.appointmentTime;
      if (appointmentTime) {
        // If time is in 12-hour format (e.g., "09:03 PM"), convert to 24-hour
        const timeMatch = appointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const period = timeMatch[3].toUpperCase();
          
          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }
          
          appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        // Remove any AM/PM if still present
        appointmentTime = appointmentTime.replace(/\s*(AM|PM)/i, '').trim();
      } else {
        // Default to current time in 24-hour format
        const now = new Date();
        appointmentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      }

      // Create appointment for today
      const today = format(new Date(), 'yyyy-MM-dd');
      console.log('Creating appointment with:', {
        patientId: patient.id,
        visitType: walkInForm.visitType,
        appointmentDate: today,
        appointmentTime: appointmentTime,
      });
      
      const appointment = await appointmentsApi.create({
        patientId: patient.id,
        visitType: walkInForm.visitType,
        appointmentDate: today,
        appointmentTime: appointmentTime,
      });
      
      console.log('Appointment created:', appointment);
      
      // Mark as arrived since it's a walk-in
      await queueApi.markArrived(appointment.id);

      setShowWalkInForm(false);
      setWalkInForm({
        fullName: '',
        phoneNumber: '',
        visitType: VisitType.GENERAL_GYNE,
        appointmentTime: '',
      });
      await loadAppointments();
    } catch (error: any) {
      console.error('Failed to create walk-in', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error.response?.data?.message || 
          error.response?.data?.error || 
          error.message || 
          'Failed to create walk-in appointment';
      alert(`Error: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.BOOKED]: '#3498db',
      [AppointmentStatus.CONFIRMED]: '#2ecc71',
      [AppointmentStatus.ARRIVED]: '#f39c12',
      [AppointmentStatus.WITH_DOCTOR]: '#9b59b6',
      [AppointmentStatus.FINISHED]: '#95a5a6',
      [AppointmentStatus.NO_SHOW]: '#e74c3c',
      [AppointmentStatus.CANCELLED]: '#95a5a6',
    };
    return colors[status] || '#95a5a6';
  };

  const getVisitTypeLabel = (type: VisitType) => {
    const labels: Record<VisitType, string> = {
      [VisitType.PREGNANCY_FIRST_VISIT]: 'Pregnancy First Visit',
      [VisitType.PREGNANCY_FOLLOWUP]: 'Pregnancy Follow-up',
      [VisitType.ULTRASOUND]: 'Ultrasound',
      [VisitType.POSTPARTUM_NORMAL]: 'Postpartum (Normal)',
      [VisitType.POSTPARTUM_CSECTION]: 'Postpartum (C-section)',
      [VisitType.FAMILY_PLANNING]: 'Family Planning',
      [VisitType.INFERTILITY]: 'Infertility',
      [VisitType.GENERAL_GYNE]: 'General Gynecology',
      [VisitType.PAP_SMEAR]: 'Pap Smear',
      [VisitType.EMERGENCY]: 'Emergency',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.emergencyFlag && !b.emergencyFlag) return -1;
    if (!a.emergencyFlag && b.emergencyFlag) return 1;
    return (a.queueNumber || 0) - (b.queueNumber || 0);
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Today's Appointments</h2>
        <button onClick={() => setShowWalkInForm(!showWalkInForm)} className="primary-button">
          {showWalkInForm ? 'Cancel' : 'Add Walk-in'}
        </button>
      </div>

      {showWalkInForm && (
        <div className="walk-in-form">
          <h3>Add Walk-in Patient</h3>
          <form onSubmit={handleWalkInSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={walkInForm.fullName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={walkInForm.phoneNumber}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phoneNumber: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Visit Type</label>
                <select
                  value={walkInForm.visitType}
                  onChange={(e) => setWalkInForm({ ...walkInForm, visitType: e.target.value as VisitType })}
                >
                  {Object.values(VisitType).map((type) => (
                    <option key={type} value={type}>
                      {getVisitTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={walkInForm.appointmentTime}
                  onChange={(e) => setWalkInForm({ ...walkInForm, appointmentTime: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="primary-button">
              Add Walk-in
            </button>
          </form>
        </div>
      )}

      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>Queue #</th>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Visit Type</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.map((appointment) => (
              <tr key={appointment.id} className={appointment.emergencyFlag ? 'emergency' : ''}>
                <td>
                  {appointment.queueNumber || '-'}
                  {appointment.emergencyFlag && ' 🚨'}
                </td>
                <td>{appointment.patient?.fullName || 'N/A'}</td>
                <td>{appointment.patient?.phoneNumber || 'N/A'}</td>
                <td>{getVisitTypeLabel(appointment.visitType)}</td>
                <td>{appointment.appointmentTime}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {appointment.status === AppointmentStatus.CONFIRMED && (
                      <button
                        onClick={() => handleMarkArrived(appointment.id)}
                        className="small-button"
                      >
                        Mark Arrived
                      </button>
                    )}
                    <button
                      onClick={() => handleEmergencyFlag(appointment.id)}
                      className="small-button"
                    >
                      {appointment.emergencyFlag ? 'Remove Emergency' : 'Mark Emergency'}
                    </button>
                    <select
                      value={appointment.status}
                      onChange={(e) =>
                        handleStatusChange(appointment.id, e.target.value as AppointmentStatus)
                      }
                      className="status-select"
                    >
                      {Object.values(AppointmentStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="empty-state">No appointments for today</div>
        )}
      </div>
    </div>
  );
};

export default ReceptionDashboard;

