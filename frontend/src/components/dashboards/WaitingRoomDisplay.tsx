import React, { useState, useEffect } from 'react';
import { queueApi } from '../../services/api';
import { QueueDisplay } from '../../types';
import './WaitingRoom.css';

const WaitingRoomDisplay: React.FC = () => {
  const [display, setDisplay] = useState<QueueDisplay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisplay();
    const interval = setInterval(loadDisplay, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDisplay = async () => {
    try {
      const data = await queueApi.getWaitingRoomDisplay();
      setDisplay(data);
    } catch (error) {
      console.error('Failed to load waiting room display', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="waiting-room-loading">Loading...</div>;
  }

  return (
    <div className="waiting-room">
      <div className="waiting-room-header">
        <h1>Waiting Room Display</h1>
        <p className="clinic-name">OB/GYN Clinic</p>
      </div>

      <div className="display-section">
        <div className="current-patient">
          <div className="label">Currently Seeing</div>
          <div className="number-display">
            {display?.currentNumber ? `#${display.currentNumber}` : '---'}
          </div>
          <div className="patient-name">
            {display?.currentPatient || '---'}
          </div>
        </div>

        <div className="next-patient">
          <div className="label">Next</div>
          <div className="number-display">
            {display?.nextNumber ? `#${display.nextNumber}` : '---'}
          </div>
          <div className="patient-name">
            {display?.nextPatient || '---'}
          </div>
        </div>
      </div>

      <div className="waiting-room-footer">
        <p>Thank you for your patience</p>
        <p className="current-time">
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default WaitingRoomDisplay;

