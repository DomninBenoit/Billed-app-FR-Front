/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("then choice an invalide file", async () => {
      $.fn.modal = jest.fn()
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const file = screen.getByTestId("file");
      const fileTest = new File(["test.pdf"], "test.pdf", {type: "image/pdf"});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      file.addEventListener('change', handleChangeFile);
      userEvent.upload(file, fileTest);
      expect(handleChangeFile).toHaveBeenCalled();

    })
    test("then choice an valid file", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const file = screen.getByTestId("file");
      const fileTest = new File(["test.png"], "test.png", {type: "image/png"});
      userEvent.upload(file, fileTest);

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      file.addEventListener('change', handleChangeFile);
      userEvent.upload(file, fileTest);
    })
    test("Then I complete the rest of the form and submit it", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const formNewBill = screen.getByTestId("form-new-bill");
      const btnSendBill = screen.getByTestId('btn-send-bill');
      const handleSubmit =  jest.fn(newBill.handleSubmit);
      formNewBill.addEventListener("submit", handleSubmit);
      userEvent.click(btnSendBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as employee", () => {
    beforeEach(() => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
    test("Then it creates a new bill", async () => {
      // Init the UI
      document.body.innerHTML = NewBillUI()

			// Create an object with the values to add in the BDD
      const earlyBillInfos = {
        fileUrl: "http://localhost/images/test.png",
        fileName: "test.png",
        email: "a@a",
      }

			// Get the bills method in the mock
      const mockedBills = mockStore.bills()

			// Mock the update and create methods
      const spyCreate = jest.spyOn(mockedBills, "create")
      const spyUpdate = jest.spyOn(mockedBills, "update")

			// Call the create method with the values to add
      const billCreated = await spyCreate(earlyBillInfos)

			// Check if the method have been called
      expect(spyCreate).toHaveBeenCalled()

			// Check the returned values by the create method
      expect(billCreated.fileUrl).toBe("http://localhost/images/test.png")

			// Create an object with the values to add in the BDD
      const completeBillInfos = {
        vat: "20",
        fileUrl: "http://localhost/images/test.jpg",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "test",
        name: "test",
        fileName: "test.jpg",
        date: "2022-06-27",
        amount: 100,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      }

			// Call the update method with the values to add
      const billUpdated = await spyUpdate(completeBillInfos)

			// Check the returned values by the update method
      expect(billUpdated.fileUrl).toBe("http://localhost/images/test.jpg")
      expect(billUpdated.fileName).toBe("test.jpg")
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    
  test("fetches messages from an API and fails with 500 message error", async () => {
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  })
})
  })
