import { Client } from "@elastic/elasticsearch";
export const clientElasticsearch = new Client({
  node: `${process.env.ELASTIC_URL}:${process.env.ELASTIC_PORT}`,
  auth: {
    username: process.env.ELASTIC_USERNAME ?? "",
    password: process.env.ELASTIC_PASSWORD ?? "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function createIndex() {
  const indexName = "todos";

  const exists = await clientElasticsearch.indices.exists({ index: indexName });

  if (!exists) {
    await clientElasticsearch.indices.create({
      index: indexName,
      mappings: {
        properties: {
          title: { type: "text" },
          description: { type: "text" },
          status: { type: "boolean" },
          createddate: { type: "text" },
          updateddate: { type: "text" },
          userId: { type: "integer" },
        },
      },
    });
  }
}

createIndex();
