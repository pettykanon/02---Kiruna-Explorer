import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { User, Role } from "../../models/User.mjs";

const basePath = "/api"

// Helper function that logs in a user and returns the cookie
// Can be used to log in a user before the tests or in the tests
const login = async (userInfo) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: userInfo.username,
                password: userInfo.password
            })
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}

// Example Parameters for the tests
const residentUser = { id:1, username: "Romeo", password: "1111", role: Role.URBAN_PLANNER}
const urbanplannerUser = { id:2, username: "Juliet", password: "2222", role: Role.RESIDENT}
const no_profile = { id:3, username: "user1", password: "pass1", role: null}
//cookie for the login, in case of API that needs an authentication before
let resident_cookie
let urbanplanner_cookie

// create a describe for each API - containing tests for all use cases
describe("Integration Test POST /sessions - Login", ()=>{
    beforeEach(async ()=>{
        await cleanup()
    })

    test("Login as a resident", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: residentUser.username,
                password: residentUser.password
            })

        expect(result.status).toBe(201)

        expect(result.body).toEqual({
            id: residentUser.id,
            username: residentUser.username,
            role: residentUser.role
        })
    })

    test("Login as a urban planner", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: urbanplannerUser.username,
                password: urbanplannerUser.password
            })

        expect(result.status).toBe(201)

        expect(result.body).toEqual({
            id: urbanplannerUser.id,
            username: urbanplannerUser.username,
            role: urbanplannerUser.role
        })
    })

    test("Login as non-existing user", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: no_profile.username,
                password: no_profile.password
            })

        expect(result.status).toBe(401)

        expect(result.body).toEqual({message: "Incorrect username or password."})
    })

    test("Login with wrong password", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: urbanplannerUser.username,
                password: "222"
            })

        expect(result.status).toBe(401)

        expect(result.body).toEqual({message: "Incorrect username or password."})
    })

    test("Login with wrong username", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: "giuliet",
                password: urbanplannerUser.password
            })

        expect(result.status).toBe(401)

        expect(result.body).toEqual({message: "Incorrect username or password."})
    })
})

// create a describe for each API - containing tests for all use cases
describe("Integration Test GET /sessions/current - Authenticate", ()=>{
    beforeEach(async ()=>{
        await cleanup()
        //we create the cookie of resident login before each test so that we can authenticate with it
        resident_cookie = await login(residentUser)
    })

    test("As logged in user", async ()=>{
        const result = await request(app)
            .get(`${basePath}/sessions/current`)
            // set the cookie to authenticate
            .set("Cookie",resident_cookie)
            .send()

        expect(result.status).toBe(200)

        expect(result.body).toEqual({
            id: residentUser.id,
            username: residentUser.username,
            role: residentUser.role
        })
    })

    test("As not logged in user", async ()=>{
        const result = await request(app)
            .get(`${basePath}/sessions/current`)
            .send()

        expect(result.status).toBe(401)

        expect(result.body.error).toEqual("Not authorized")
    })
})

describe("Integration Test DELETE /sessions/current - Logout", ()=>{
    beforeEach(async ()=>{
        await cleanup()
        //we create the cookie of resident login before each test so that we can authenticate with it
        resident_cookie = await login(residentUser)
    })

    test("As logged in user", async ()=>{
        const result = await request(app)
            .delete(`${basePath}/sessions/current`)
            // set the cookie to authenticate
            .set("Cookie",resident_cookie)
            .send()

        expect(result.status).toBe(200)

        expect(result.body).toEqual({})
    })

    test("As not logged in user", async ()=>{
        const result = await request(app)
            .delete(`${basePath}/sessions/current`)
            .send()

        expect(result.status).toBe(401)

        expect(result.body.error).toEqual("Not authorized")
    })
})

