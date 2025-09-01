import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  FolderOpen as ProjectIcon,
  Comment as CommentIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAdminDashboard } from '../../hooks/admin';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { data: stats, isLoading, error, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load dashboard data: {error?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          System overview and key metrics
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {/* User Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="primary"
            subtitle={`${stats?.users?.newThisWeek || 0} new this week`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.users?.active || 0}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="success"
            subtitle={`${stats?.users?.suspended || 0} suspended`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={stats?.content?.projects?.total || 0}
            icon={<ProjectIcon sx={{ fontSize: 40 }} />}
            color="info"
            subtitle={`${stats?.content?.projects?.active || 0} active`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Sessions"
            value={stats?.system?.activeSessions || 0}
            icon={<SecurityIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>

        {/* User Roles Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Roles
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <AdminIcon color="error" />
                  <Typography>Administrators</Typography>
                </Box>
                <Chip label={stats?.users?.admins || 0} color="error" />
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <SecurityIcon color="warning" />
                  <Typography>Moderators</Typography>
                </Box>
                <Chip label={stats?.users?.moderators || 0} color="warning" />
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <PeopleIcon color="primary" />
                  <Typography>Regular Users</Typography>
                </Box>
                <Chip 
                  label={(stats?.users?.total || 0) - (stats?.users?.admins || 0) - (stats?.users?.moderators || 0)} 
                  color="primary" 
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Content Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Overview
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <ProjectIcon color="info" />
                  <Typography>Total Projects</Typography>
                </Box>
                <Typography variant="h6">{stats?.content?.projects?.total || 0}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon color="success" />
                  <Typography>Active Projects</Typography>
                </Box>
                <Typography variant="h6">{stats?.content?.projects?.active || 0}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <CommentIcon color="primary" />
                  <Typography>Total Comments</Typography>
                </Box>
                <Typography variant="h6">{stats?.content?.comments?.total || 0}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  New projects this week
                </Typography>
                <Chip 
                  label={stats?.content?.projects?.newThisWeek || 0} 
                  size="small" 
                  color="info" 
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity Summary
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip 
                label={`${stats?.users?.newThisWeek || 0} new users this week`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={`${stats?.content?.projects?.newThisWeek || 0} new projects this week`}
                color="info"
                variant="outlined"
              />
              <Chip 
                label={`${stats?.users?.suspended || 0} suspended accounts`}
                color={stats?.users?.suspended > 0 ? "warning" : "default"}
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
