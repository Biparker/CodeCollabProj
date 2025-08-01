import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import api from '../utils/api'; // Use your configured API instance
import { Link as RouterLink } from 'react-router-dom';

const Members = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users - using configured api instance
        const usersRes = await api.get('/users');
        // Fetch all projects - using configured api instance  
        const projectsRes = await api.get('/projects');
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users or projects:', err);
        setError('Failed to fetch users or projects');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: get projects for a user
  const getUserProjects = (userId) => {
    return projects.filter(p => {
      // Handle both populated and unpopulated owner fields
      const ownerId = typeof p.owner === 'object' && p.owner !== null ? p.owner._id : p.owner;
      return (
        ownerId && ownerId.toString() === userId.toString()
      ) || (
        p.collaborators && p.collaborators.some(c =>
          (typeof c.userId === 'object' && c.userId !== null
            ? c.userId._id
            : c.userId
          )?.toString() === userId.toString()
        )
      );
    });
  };

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Members</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Project Name(s)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => {
              const userProjects = getUserProjects(user._id);
              return (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.skills && user.skills.length > 0
                      ? user.skills.join(', ')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {user.experience ? user.experience : '—'}
                  </TableCell>
                  <TableCell>
                    {user.availability ? user.availability : '—'}
                  </TableCell>
                  <TableCell>
                    {userProjects.length > 0 ? (
                      userProjects.map((p, idx) => (
                        <span key={p._id}>
                          <Typography
                            variant="h6"
                            component={RouterLink}
                            to={`/projects#${p._id}`}
                            style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
                            gutterBottom
                          >
                            {p.title}
                          </Typography>
                          {idx < userProjects.length - 1 && ', '}
                        </span>
                      ))
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Members; 