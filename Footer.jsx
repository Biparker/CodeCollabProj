import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              CodeCollabProj
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Collaborate on code projects with ease. Share, learn, and build together.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link
              component={RouterLink}
              to="/projects"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Projects
            </Link>
            <Link
              component={RouterLink}
              to="/dashboard"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Dashboard
            </Link>
            <Link
              component={RouterLink}
              to="/profile"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Profile
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <Link
              href="#"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Documentation
            </Link>
            <Link
              href="#"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Support
            </Link>
            <Link
              href="#"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Privacy Policy
            </Link>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' CodeCollabProj. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;