import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function DettaglioCarta() {
  const { numeroCarta } = useParams();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dettaglio carta
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Numero carta: {numeroCarta}
      </Typography>
    </Box>
  );
}

export default DettaglioCarta;
