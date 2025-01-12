const express = require("express");
const authService = require("../services/authService");


const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    const user = await authService.signup({ username, email, password });

    res.status(201).send({ message: "User Created Successfully", user });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    const { token, username } = await authService.login({ email, password });
    res.json({ token, username });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error.message);
  }
};

module.exports = { signup, login }; // ✅ Export functions directly
