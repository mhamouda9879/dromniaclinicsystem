import React, { useState, useEffect } from 'react';
import { queueApi, visitsApi, appointmentsApi } from '../../services/api';
import { Appointment, Visit, AppointmentStatus } from '../../types';
import { format } from 'date-fns';
import './Dashboard.css';

const DoctorDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitForm, setVisitForm] = useState({
    chiefComplaint: '',
    subjectiveNotes: '',
    examinationSummary: '',
    investigations: [] as string[],
    diagnosisSummary: '',
    treatmentPlan: '',
    nextVisitRecommendation: '',
  });

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentAppointment) {
      loadVisit();
    }
  }, [currentAppointment]);

  const loadQueue = async () => {
    try {
      const data = await queueApi.getToday();
      setQueue(data);
      
      // Get current appointment
      const current = await queueApi.getCurrent();
      setCurrentAppointment(current);
    } catch (error) {
      console.error('Failed to load queue', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVisit = async () => {
    if (!currentAppointment) return;
    
    try {
      const existing = await visitsApi.getByAppointment(currentAppointment.id);
      if (existing) {
        setVisit(existing);
        setVisitForm({
          chiefComplaint: existing.chiefComplaint || '',
          subjectiveNotes: existing.subjectiveNotes || '',
          examinationSummary: existing.examinationSummary || '',
          investigations: existing.investigations || [],
          diagnosisSummary: existing.diagnosisSummary || '',
          treatmentPlan: existing.treatmentPlan || '',
          nextVisitRecommendation: existing.nextVisitRecommendation || '',
        });
      }
    } catch (error) {
      console.error('Failed to load visit', error);
    }
  };

  const handleStartConsultation = async (appointmentId: string) => {
    try {
      await queueApi.startConsultation(appointmentId);
      await loadQueue();
    } catch (error) {
      console.error('Failed to start consultation', error);
      alert('Failed to start consultation');
    }
  };

  const handleFinishConsultation = async () => {
    if (!currentAppointment) return;

    try {
      // Save or update visit
      if (visit) {
        await visitsApi.update(visit.id, visitForm);
      } else {
        await visitsApi.create({
          appointmentId: currentAppointment.id,
          ...visitForm,
        });
      }

      // Finish consultation
      await queueApi.finishConsultation(currentAppointment.id);
      
      // Reset state
      setCurrentAppointment(null);
      setVisit(null);
      setVisitForm({
        chiefComplaint: '',
        subjectiveNotes: '',
        examinationSummary: '',
        investigations: [],
        diagnosisSummary: '',
        treatmentPlan: '',
        nextVisitRecommendation: '',
      });
      
      await loadQueue();
    } catch (error) {
      console.error('Failed to finish consultation', error);
      alert('Failed to finish consultation');
    }
  };

  const handleNextPatient = async () => {
    try {
      const next = await queueApi.getNext();
      if (next) {
        await handleStartConsultation(next.id);
      } else {
        alert('No next patient in queue');
      }
    } catch (error) {
      console.error('Failed to get next patient', error);
      alert('Failed to get next patient');
    }
  };

  const getVisitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pregnancy_first_visit: 'Pregnancy First Visit',
      pregnancy_followup: 'Pregnancy Follow-up',
      ultrasound: 'Ultrasound',
      postpartum_normal: 'Postpartum (Normal)',
      postpartum_csection: 'Postpartum (C-section)',
      family_planning: 'Family Planning',
      infertility: 'Infertility',
      general_gyne: 'General Gynecology',
      pap_smear: 'Pap Smear',
      emergency: 'Emergency',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="loading">Loading queue...</div>;
  }

  return (
    <div className="dashboard doctor-dashboard">
      <div className="dashboard-grid">
        <div className="queue-panel">
          <h2>Queue</h2>
          <div className="queue-list">
            {queue.map((appointment, index) => (
              <div
                key={appointment.id}
                className={`queue-item ${appointment.id === currentAppointment?.id ? 'active' : ''} ${
                  appointment.emergencyFlag ? 'emergency' : ''
                }`}
                onClick={() => appointment.status === AppointmentStatus.ARRIVED && handleStartConsultation(appointment.id)}
              >
                <div className="queue-number">{appointment.queueNumber || index + 1}</div>
                <div className="queue-info">
                  <div className="patient-name">
                    {appointment.patient?.fullName || 'N/A'}
                    {appointment.emergencyFlag && ' 🚨'}
                  </div>
                  <div className="visit-type">{getVisitTypeLabel(appointment.visitType)}</div>
                </div>
                <div className="queue-status">{appointment.status}</div>
              </div>
            ))}
            {queue.length === 0 && <div className="empty-state">No patients in queue</div>}
          </div>
          {currentAppointment && (
            <button onClick={handleNextPatient} className="primary-button">
              Next Patient
            </button>
          )}
        </div>

        <div className="consultation-panel">
          {currentAppointment ? (
            <>
              <h2>Current Consultation</h2>
              <div className="patient-info-card">
                <h3>{currentAppointment.patient?.fullName}</h3>
                <div className="info-row">
                  <span>Phone:</span>
                  <span>{currentAppointment.patient?.phoneNumber}</span>
                </div>
                <div className="info-row">
                  <span>Visit Type:</span>
                  <span>{getVisitTypeLabel(currentAppointment.visitType)}</span>
                </div>
                {currentAppointment.patient?.gyneProfile && (
                  <div className="info-row">
                    <span>G-P-A:</span>
                    <span>
                      {currentAppointment.patient.gyneProfile.gravidity || 0}-
                      {currentAppointment.patient.gyneProfile.parity || 0}-
                      {currentAppointment.patient.gyneProfile.abortions || 0}
                    </span>
                  </div>
                )}
              </div>

              <div className="visit-form">
                <div className="form-group">
                  <label>Chief Complaint</label>
                  <textarea
                    value={visitForm.chiefComplaint}
                    onChange={(e) => setVisitForm({ ...visitForm, chiefComplaint: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Subjective Notes</label>
                  <textarea
                    value={visitForm.subjectiveNotes}
                    onChange={(e) => setVisitForm({ ...visitForm, subjectiveNotes: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Examination Summary</label>
                  <textarea
                    value={visitForm.examinationSummary}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, examinationSummary: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Investigations</label>
                  <input
                    type="text"
                    placeholder="e.g., Lab work, Ultrasound"
                    value={visitForm.investigations.join(', ')}
                    onChange={(e) =>
                      setVisitForm({
                        ...visitForm,
                        investigations: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Diagnosis</label>
                  <textarea
                    value={visitForm.diagnosisSummary}
                    onChange={(e) => setVisitForm({ ...visitForm, diagnosisSummary: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Treatment Plan</label>
                  <textarea
                    value={visitForm.treatmentPlan}
                    onChange={(e) => setVisitForm({ ...visitForm, treatmentPlan: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Next Visit Recommendation</label>
                  <input
                    type="text"
                    value={visitForm.nextVisitRecommendation}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, nextVisitRecommendation: e.target.value })
                    }
                    placeholder="e.g., Follow-up in 2 weeks"
                  />
                </div>

                <button onClick={handleFinishConsultation} className="primary-button">
                  Finish Consultation
                </button>
              </div>
            </>
          ) : (
            <div className="no-consultation">
              <p>No active consultation</p>
              <p>Click on a patient from the queue to start consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

