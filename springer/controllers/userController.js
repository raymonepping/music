// controllers/UserController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { connectToCouchbase } = require("../configurations/couchbaseConnection");

// const { getClusterCollection } = require('../configurations/pool');

const logger = require("../configurations/logger");

exports.createOrFindUsername = async (req, res) => {
  const { first_name, last_name, user_password } = req.body;
  let baseUsername = `${first_name}${last_name.charAt(0)}`.toLowerCase();
  let username = baseUsername;

  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const collection = bucket
      .scope(process.env.COUCHBASE_SCOPE_DIRECTUS)
      .collection(process.env.COUCHBASE_COLLECTION_USERS);

    let exists = true;
    let counter = 0;

    while (exists) {
      try {
        await collection.get(username);
        counter += 1;
        username = `${baseUsername}${counter}`;
      } catch (error) {
        if (error.name === "DocumentNotFoundError") {
          exists = false;
        } else {
          throw error;
        }
      }
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);
    const userDocument = {
      username,
      user_password: hashedPassword,
      first_name,
      last_name,
      roles: "user",
      type: "user",
    };
    await collection.upsert(username, userDocument);

    res.status(201).json({ message: "User created successfully", username });
  } catch (error) {
    logger.error("Error creating user in Couchbase", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  logger.debug("Login request received for:", username);
  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const collection = bucket
      .scope(process.env.COUCHBASE_SCOPE_DIRECTUS)
      .collection(process.env.COUCHBASE_COLLECTION_USERS);

    // Retrieve Couchbase collection, specifying COUCHBASE_COLLECTION_USERS
    // const collection = await getClusterCollection(process.env.COUCHBASE_COLLECTION_USERS);

    let user;
    try {
      const userDoc = await collection.get(username);
      user = userDoc.content;
      logger.debug("User document found:", user);
    } catch (error) {
      if (error.name === "DocumentNotFoundError") {
        console.warn("User not found:", username);
        return res.status(404).json({ error: "User not found" });
      } else {
        throw error;
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      console.warn("Invalid password for user:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    logger.info(`Login successful for user: ${username}`);

    res.json({
      token,
      user: {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error logging in user" });
  }
};
