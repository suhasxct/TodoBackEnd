import { buildSchema } from "graphql";
export const schema = buildSchema(`#graphql
type User{
    id:        Int
    profile: String
    username:String
    firstName:String
    lastName:String
}
  type Todo{
    id:            String
    title:         String
    description:   String
    status:        Boolean
    createddate:   String
    updateddate:   String
  }
  type Query { 
    getTodos(pageNo:Int): [Todo]
    searchTodos(search:String):[Todo]
    getprofilepic: User
   } 
  type Mutation {
    setprofilepic(url:String!):String
    addTodo(title: String!, description: String!, status: Boolean):String
    deleteTodo(id:Int) : String    
    updateTodo(id:Int,title: String, description: String, status: Boolean):
    String
  }
  `);
