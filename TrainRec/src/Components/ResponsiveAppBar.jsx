import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { colorModeContext } from '../themes';

const pages = ['Dashboard', 'Workouts', 'Weather', 'GymLocator'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function GradientRadioIcon({ startColor, endColor, ...props }) {
  const gradientId = React.useId();

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.5" fill={`url(#${gradientId})`} />
    </SvgIcon>
  );
}

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(colorModeContext);
  const gradientStart = theme.palette.mode === 'dark' ? '#7c4dff' : '#fff4e8';
  const gradientEnd = theme.palette.mode === 'dark' ? '#a855f7' : '#ffc78f';
  const moodGradient = `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (setting) => {
    setAnchorElUser(null);
    
    if (!setting || typeof setting !== 'string') return; // Safety check

    if (setting === 'Logout') {
      localStorage.removeItem('token'); // Clear the session
      navigate('/login');
    } else if (setting === 'Profile') {
      navigate('/profile');
    } else if (setting === 'Account') {
      navigate('/account');
    } else if (setting === 'Dashboard') {
      navigate('/');
    }
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Brand logo and title - desktop */}
          <GradientRadioIcon
            startColor={gradientStart}
            endColor={gradientEnd}
            sx={{
              display: { xs: 'none', md: 'flex' },
              mr: 1,
              fontSize: '4rem',
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: '"Boldonse", system-ui',
              fontWeight: 700,
              fontSize: '2rem',
              letterSpacing: '.1rem',
              textDecoration: 'none',
              background: moodGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TrainREC
          </Typography>

          {/* Mobile navigation menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                      <Typography sx={{ textAlign: 'center' }}>
                          <Link style={{ color: 'white', textDecoration: 'none' }} to={`/${page}`}>
                                {page}
                          </Link>
                      </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <GradientRadioIcon
            startColor={gradientStart}
            endColor={gradientEnd}
            sx={{
              display: { xs: 'flex', md: 'none' },
              mr: 1,
              fontSize: '4rem',
            }}
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: '"Boldonse", system-ui',
              fontWeight: 700,
              fontSize: '2rem',
              letterSpacing: '.1rem',
              textDecoration: 'none',
              background: moodGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TrainREC
          </Typography>
          {/* Desktop navigation links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                <Link style={{ color: 'white', textDecoration: 'none' }} to={`/${page}`}>{page}</Link>
              </Button>
            ))}
          </Box>
          {/* Theme mode toggle */}
          <Box display="flex" justifyContent={"space-between"} p={2}>
            <Tooltip title="Toggle light/dark mode">
              <IconButton onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
              
          {/* User avatar and settings menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
