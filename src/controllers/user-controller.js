import userService from '../services/user-service.js';
import User from '../models/user.js';
import authRoute from '../middleware/authRoute.js';

const validateCreateUserFields = ({ first_name, last_name, password, userName }) => {
  if (!first_name || !last_name || !password || !userName) {
    return 'Bad Request, All fields are required';
  }
  if (!first_name.trim() || !last_name.trim()) {
    return 'Bad Request, First name and last name are required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userName)) {
    return 'Bad Request, Invalid email address';
  }

  return null; 
};

export const getCurrentUser = async (req, res) => {
  try {
    const status = await authRoute(req, res); 
    if (status === 200) {
        const userResponse = await userService.getCurrentUser(req, res);
        return res.status(200).json(userResponse);
      } else {
        return res.status(status).send("");
      }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const status = await authRoute(req, res); 

  
    if(status ===200) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Bad Request, Empty request body' });
         }
        const { first_name, last_name, password, userName, id, account_created, account_updated } = req.body;
        if(userName || id || account_created || account_updated){
            console.log("user is trying to update the system variables like id, account_created, account_updated or username");
            return res.status(400).send({
                message: "User is trying to update the system variables like id, account_created, account_updated or username"
            });
    }
    
    const userResponse = await userService.updateCurrentUser(req, res, { first_name, last_name, password });
    return res.status(200).json(userResponse);}else {
        return res.status(status).send("");
      }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, password, userName } = req.body;

    // Validate fields
    const validationError = validateCreateUserFields({ first_name, last_name, password, userName });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Check if user with the email already exists
    const existingUser = await User.findOne({ where: { userName: userName } });
    if (existingUser) {
      return res.status(400).json({ message: 'Bad Request, User already exists!' });
    }

    const userResponse = await userService.createUser({ first_name, last_name, password, userName });
    return res.status(201).json(userResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
