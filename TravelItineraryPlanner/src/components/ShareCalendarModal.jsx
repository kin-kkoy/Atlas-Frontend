import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axiosInstance from '../utils/axios';

function ShareCalendarModal({ show, handleClose, calendarId }) {
  const [accessLevel, setAccessLevel] = useState('view');
  const [shareLink, setShareLink] = useState('');

  const generateLink = async () => {
    try {
      const response = await axiosInstance.post(
        `/calendar/${calendarId}/share`,
        { accessLevel }
      );
      setShareLink(response.data.shareLink);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share Calendar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Access Level</Form.Label>
            <Form.Select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </Form.Select>
          </Form.Group>
          {shareLink && (
            <div className="mb-3">
              <label>Share Link:</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={shareLink}
                  readOnly
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={generateLink}>
          Generate Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ShareCalendarModal; 