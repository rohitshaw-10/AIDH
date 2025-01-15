import React, { useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

const PatientRecords = () => {
  const [records] = useState([
    { id: 1, date: '2024-08-20', details: 'General checkup - All clear' },
    { id: 2, date: '2024-08-15', details: 'Blood test - Normal' },
    { id: 3, date: '2024-08-10', details: 'X-ray - No issues detected' },
  ]);

  return (
    <Container maxWidth="sm" style={{ marginTop: '6rem' }}>
      <Typography variant="h4" gutterBottom>Patient Records</Typography>
      <Box mt={2} p={2} style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
        <List>
          {records.map((record) => (
            <ListItem key={record.id}>
              <ListItemText primary={record.date} secondary={record.details} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default PatientRecords;
