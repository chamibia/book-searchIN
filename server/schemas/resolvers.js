const { authMiddleware } = require("../utils/auth");

const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
    users: async () => {
      return User.find().select("-__v -password");
    },
    user: async (parent, { email }) => {
      return User.findOne({ email }).select("-__v -password");
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    //args is coming from typeDefs and context is coming from the signin user
    saveBook: async (parent, args, context) => {
      const book = await User.findByIdAndUpdate(context.user._id, {
        savedBooks: {
          $push: {
            authors: args.authors,
            description: args.description,
            title: args.title,
            bookId: args.bookId,
            image: args.image,
            link: args.link,
          },
        },
      });

      return book;
    },
    removeBook: async (parent, args, context) => {
      const removed = await User.findByIdAndUpdate(context.user._id, {
        $pull: { bookId: args.bookId },
      });
      return removed;
    },
  },
};

module.exports = resolvers;
