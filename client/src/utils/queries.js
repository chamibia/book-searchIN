import { gql } from "@apollo/client";

export const QUERY_ME_BASIC = gql`
  {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        _id
        authors
        description
        title
        image
        link
      }
    }
  }
`;
