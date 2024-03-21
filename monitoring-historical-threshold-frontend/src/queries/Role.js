import gql from 'graphql-tag';

export const CREATE_ROLE = gql`
  mutation Mutation($createRoleInput: CreateRoleInput!) {
    createRole(createRoleInput: $createRoleInput) {
      id
      name
    }
  }
`;

//data createRoleInput
//{
//  "createRoleInput": {
//    "name": null
//  }
//}

export const UPDATE_ROLE = gql`
mutation UpdateRole($updateRoleInput: UpdateRoleInput!) {
  updateRole(updateRoleInput: $updateRoleInput) {
    id
    name
  }
}
`;

//data
//{
//  "updateRoleInput": {
//    "name": null,
//    "id": null
//  }
//}

export const DELETE_ROLE = gql`
mutation RemoveRole($removeRoleId: String!) {
  removeRole(id: $removeRoleId) {
    id
    name
  }
}
`;
//data
//{
//  "removeRoleId": null
//}

export const READ_ROLE = gql`
  query ReadRole($readRoleId: String!) {
    readRole(id: $readRoleId) {
      id
      name
    }
  }
`;
//data
//{
//  "readRoleId": null
//}

export const READ_ROLES = gql`
  query ReadRoles {
    readRoles {
      id
      name
    }
}
`;
