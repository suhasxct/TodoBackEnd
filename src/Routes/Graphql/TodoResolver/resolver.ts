import nodemailer from "nodemailer";
import client from "../../..";
import { clientElasticsearch } from "../../../imports/elasticsearch";
import { clientRedis } from "../../../imports/redis";
export const root = {
  /*...........................getTodos..................................*/
  async getTodos(pageNo: any, context: any) {
    if (context.userId == null) throw new Error("Invalid Login");
    const userId = context.userId;
    const { pageNo: page } = pageNo as any;
    const cached = await clientRedis.get(userId.toString());
    if (cached) {
      const data: any = JSON.parse(cached);
      if (Math.floor(data.length / 3) >= 1) {
        return data.slice(page * 3, page * 3 + 3);
      } else {
        return data.slice(page * 3);
      }
    }
    const response = await client.todo.findMany({
      where: {
        userId: userId,
      },
    });
    const formatted = response.map((todo) => ({
      ...todo,
      createddate: todo.createddate?.toISOString(),
      updateddate: todo.updateddate?.toISOString(),
    }));

    await clientRedis.set(userId.toString(), JSON.stringify(formatted), {
      EX: 3600, //Cache will be deleted after 1 hr
    });
    if (formatted.length / 3 >= 1) {
      return formatted.slice(page * 3, page * 3 + 3);
    } else {
      return formatted.slice(page * 3);
    }
  },
  /*..................Adding Todos Resolver..................................*/

  async addTodo({ title, description, status }: any, context: any) {
    const userId = context.userId;

    /*.......start Redis Resolver..................................*/

    await clientRedis.del(userId.toString());

    /*.......End Redis Resolver..................................*/
    if (!userId) throw new Error("NO USER FOUND");
    const response = await client.todo.create({
      data: {
        title: title,
        description: description,
        status: status,
        createddate: new Date(),
        updateddate: new Date(),
        userId: userId,
      },
    });
    try {
      const result = await clientElasticsearch.index({
        index: "todos",
        id: response.id.toString(),
        body: {
          title: title,
          description: description,
          status: status,
          createddate: new Date(),
          updateddate: new Date(),
          userId: userId,
        },
      });
    } catch (error) {
      console.error("Error adding Todo:", error);
    }
    return "Todo Added Successfully";
  },
  /*.................Updating Todos Resolver..................................*/

  async updateTodo({ id, title, description, status }: any, context: any) {
    if (context.userId == null) throw new Error("Invalid Login");
    try {
      const result = await clientElasticsearch.update({
        index: "todos",
        id: id,
        body: {
          //@ts-ignore
          doc: {
            title: title,
            description: description,
            status: status,
            updateddate: new Date(),
          },
        },
      });
    } catch (error: any) {
      console.error("Error updating Todo:", error.meta?.body?.error || error);
    }

    const userId = context.userId;
    await clientRedis.del(userId.toString());
    if (!userId) throw new Error("NO USER FOUND");
    const updateData: any = {
      updateddate: new Date(),
    };
    if (title !== null) updateData.title = title;
    if (description !== null) updateData.description = description;
    if (status !== null) updateData.status = status;
    await client.todo.update({
      where: { id: id, userId: userId },
      data: updateData,
    });
    return "Todo Updated Successfully";
  },
  /*...............Deleting Todos Resolver..................................*/

  async deleteTodo({ id }: any, context: any) {
    if (context.userId == null) throw new Error("Invalid Login");
    try {
      const result = await clientElasticsearch.delete({
        index: "todos",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting Todo:", error);
    }
    const userId = context.userId;
    await clientRedis.del(userId.toString());
    if (!userId) throw new Error("NO USER FOUND");
    await client.todo.delete({
      where: {
        id: id,
        userId: userId,
      },
    });
    return "Todo Deleted Successfully";
  },

  async searchTodos({ search }: any, context: any) {
    const userId = context.userId;
    try {
      const result = await clientElasticsearch.search({
        index: "todos",
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    {
                      wildcard: {
                        title: {
                          value: `*${search.toLowerCase()}*`,
                          case_insensitive: true,
                        },
                      },
                    },
                    {
                      wildcard: {
                        description: {
                          value: `*${search.toLowerCase()}*`,
                          case_insensitive: true,
                        },
                      },
                    },
                  ],
                },
              },
            ],
            filter: [
              {
                term: {
                  userId: userId,
                },
              },
            ],
          },
        },
      });

      const arr: any = [];
      const todos = result.hits.hits;
      todos.forEach((obj) => {
        const { title, description, status, createddate, updateddate }: any =
          obj._source;
        const id = obj._id;
        const obj1 = {
          id: id,
          title: title,
          description: description,
          status: status,
          createddate: createddate,
          updateddate: updateddate,
        };
        arr.push(obj1);
      });
      return arr;
    } catch (error) {
      console.error("Error searching Todos:", error);
      throw new Error("Search failed");
    }
  },

  async setprofilepic(url: string, context: any) {
    const userId = context.userId;
    const { url: dataUrl } = url as any;
    await client.user.update({
      where: {
        id: userId,
      },
      data: {
        profile: dataUrl,
      },
    });
    return "Profile Pic saved Successfully";
  },
  async getprofilepic(___: any, context: any) {
    const userId = context.userId;
    const response = await client.user.findFirst({
      where: {
        id: userId,
      },
    });
    return response;
  },
};
