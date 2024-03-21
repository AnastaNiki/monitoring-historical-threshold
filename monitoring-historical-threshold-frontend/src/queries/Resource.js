import gql from 'graphql-tag';

export const CREATE_RESOURCE = gql`
  mutation CreateResource($createResourceInput: CreateResourceInput!) {
    createResource(createResourceInput: $createResourceInput) {
      id
      name
      roleId
      role {
        id
        name
      }
    }
  }
`;

export const UPDATE_RESOURCE = gql`
  mutation UpdateResource($updateResourceInput: UpdateResourceInput!) {
    updateResource(updateResourceInput: $updateResourceInput) {
      id
      name
      roleId
    }
  }
`;

//data updateResourceInput
// {
//   "updateResourceInput": null
// }

export const READ_RESOURCES = gql`
  query ReadResources {
    readResources {
      id
      name
      roleId
      role {
        name
      }
    }
  }
`;

export const READ_RESOURCE = gql`
  query ReadResource($readResourceId: String!) {
    readResource(id: $readResourceId) {
      id
      name
      roleId
      role {
        name
      }
    }
  }
`;
//data readResourceId
// {
//   "readResourceId": null
// }

export const DELETE_RESOURCE = gql`
  mutation RemoveResource($removeResourceId: String!) {
    removeResource(id: $removeResourceId) {
      id
      name
      roleId
    }
  }
`;

//data removeResourceId
// {
//   "removeResourceId": null
// }
