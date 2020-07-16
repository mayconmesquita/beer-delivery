import axios from 'axios';

const Endpoint = 'https://api.code-challenge.ze.delivery/public/graphql';

export const Api = {
  graphql: axios.create({ baseURL: Endpoint }),
};
