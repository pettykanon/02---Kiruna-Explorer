import Select from "react-select";
import {
  stakeholders,
  documentTypes,
  popularLanguages,
} from "./Utilities/Data";
import customDropdownStyles from "./Utilities/CustomDropdownStyles";
import { useTheme } from "../contexts/ThemeContext";
import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentClass from "../classes/Document.mjs";

const AddDocumentForm = (props) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleFieldChange = (field, value) => {
    props.setNewDocument((prevDoc) => {
      const updatedDoc = { ...prevDoc, [field]: value };

      if (["year", "month", "day"].includes(field)) {
        const { year, month, day } = updatedDoc;
        updatedDoc.date = year || "";
        if (year && month) updatedDoc.date = `${year}-${month}`;
        if (year && month && day) updatedDoc.date = `${year}-${month}-${day}`;
      }

      return updatedDoc;
    });

    if (value && value !== "none") {
      setErrors((prevErrors) => {
        const { [field]: removedError, ...remainingErrors } = prevErrors;
        return remainingErrors;
      });
    }
  };

  // --- Errors ---
  const [errors, setErrors] = useState({});
  const validateFields = () => {
    const validateDate = (date) => {
      if (!date) return false; // No date is invalid
      const parts = date.split("-");
      if (parts.length === 1 && parts[0].length === 4) return true; // yyyy
      if (
        parts.length === 2 &&
        parts[0].length === 4 &&
        parts[1].length > 0 &&
        parts[1].length <= 2
      )
        return true; // yyyy-mm
      if (
        parts.length === 3 &&
        parts[0].length === 4 &&
        parts[1].length > 0 &&
        parts[1].length <= 2 &&
        parts[2].length > 0 &&
        parts[2].length <= 2
      )
        return true; // yyyy-mm-dd
      return false; // Invalid format
    };

    const newErrors = {
      ...(props.newDocument.title ? {} : { title: "Title is required" }),
      ...(props.newDocument.stakeholders?.length > 0
        ? {}
        : { stakeholder: "At least one stakeholder is required" }),
      ...(props.newDocument.scale && props.newDocument.scale !== "none"
        ? {}
        : { scale: "Scale is required" }),
      ...(props.newDocument.scale === "plan" && !props.newDocument.planNumber
        ? { planNumber: "Plan Number is required for scale 'plan'" }
        : {}),
      ...(props.newDocument.date
        ? validateDate(props.newDocument.date)
          ? {}
          : { date: "Invalid date format. Use yyyy, yyyy-mm, or yyyy-mm-dd." }
        : { date: "Date is required" }),
      ...(props.newDocument.typeId ? {} : { type: "Type is required" }),
      ...(props.newDocument.description
        ? {}
        : { description: "Description is required" }),
    };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  // --- Submit Form ---
  const handleConfirm = async () => {
    // Refresh the list of the documents

    //CAMPI OPZIONALI: PAGE + LANGUAGE + GIORNO DELLA DATA(?) + COORDINATES
    //CAMPI OBBLIGATORI: TITLE + STAKEHOLDER + SCALE(PLANE NUMBER IN CASE) + DATE + DESCRIPTION + TYPE

    const documentData = {
      title: props.newDocument.title,
      stakeholder: props.newDocument.stakeholders.map((e) => {
        return e.value;
      }),
      scale: props.newDocument.scale,
      planNumber: props.newDocument.planNumber, // Optional
      date: props.newDocument.date
        ? props.newDocument.date
            .split("-")
            .map((part, index) => (index === 0 ? part : part.padStart(2, "0")))
            .join("-")
        : "",
      typeId: props.newDocument.typeId,
      language: props.newDocument.language || null, // Set to null if not provided
      pageNumber: props.newDocument.pages || null, // Set to null if not provided
      description: props.newDocument.description, // Mandatory
      areaId: props.newAreaId,
      links: props.connections.length > 0 ? props.connections : null,
    };

    console.log(documentData);

    if (!validateFields()) {
      props.setAlertMessage(["Please fill all the mandatory fields.", "error"]);
      return;
    }

    try {
      await API.addDocument(documentData);
      props.setAlertMessage(["Document added successfully!", "success"]);
      props.setnewAreaId(null);
      props.setConnections([]);
      closeForm();
    } catch (error) {
      //console.log(error);
      props.setAlertMessage([error.message, "error"]);
    }
  };

  useEffect(() => {
    props.setNavShow(true);
  }, []);

  const closeForm = () => {
    props.toggleModal();
    clearErrors();
    resetForm();
  };

  const resetForm = () => {
    props.setNewDocument(new DocumentClass());
  };

  const calculateDaysInMonth = (year, month) => {
    if (month === 2) {
      // February: Check for leap year
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    }
    // Months with 31 days
    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
      return 31;
    }
    // Months with 30 days
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }
    return 31; // Default to 31 days
  };

  return (
    <div
      className={`${
        isDarkMode ? "dark-select" : "light-select"
      } py-4 fixed inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit z-[1040]`}
      onClick={closeForm}
    >
      <div
        className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl w-1/2 px-10 py-10 h-full overflow-y-auto rounded-lg flex flex-col relative scrollbar-thin scrollbar-webkit"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-black_text mb-4 dark:text-white_text text-2xl  ">
          Add New Document
        </h2>
        {/* Close Button */}
        <button
          onClick={closeForm}
          className="absolute top-5 text-black_text dark:text-white_text right-4 hover:text-gray-600"
        >
          <i className="bi bi-x-lg text-2xl"></i>
        </button>
        {/* Title */}
        <div className="input-title mb-4 w-full">
          <label className="text-black_text dark:text-white_text w-full ml-2 mb-1 text-base text-left">
            Title<span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Title"
            value={props.newDocument.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
              errors.title
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
            } focus:outline-none`}
          />
        </div>
        {/* Stakeholders */}
        <div className="input-stakeholder mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Stakeholders<span className="text-red-400">*</span>
          </label>
          <Select
            isMulti
            options={stakeholders.map((stakeholder) => ({
              value: stakeholder.id,
              label: stakeholder.name,
            }))}
            value={props.newDocument.stakeholders}
            onChange={(e) => handleFieldChange("stakeholders", e || [])}
            styles={customDropdownStyles(isDarkMode)}
            placeholder="None"
            isClearable={false}
            isSearchable={false}
            className="select w-full text-black_text"
          />
        </div>
        {/* Scale */}
        <div className="input-scale mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Scale<span className="text-red-400">*</span>
          </label>
          <select
            id="document-type"
            value={props.newDocument.scale}
            onChange={(e) => handleFieldChange("scale", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${
              errors.scale
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
            } focus:outline-none`}
          >
            <option value="none">None</option>
            <option value="text">Text</option>
            <option value="concept">Concept</option>
            <option value="plan">Plan</option>
            <option value="blueprints">Blueprints/effects</option>
          </select>
        </div>

        {props.newDocument.scale === "plan" && (
          <div className="input-plan mb-4 w-full">
            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
              Enter the scale 1:n
            </label>
            <input
              id="number-input"
              type="number"
              value={props.newDocument.planNumber}
              placeholder="n"
              onChange={(e) => handleFieldChange("planNumber", e.target.value)}
              className={`w-full text-base px-3 py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${
                errors.title
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
            ></input>
          </div>
        )}
        {/* Date */}
        <div className="input-type mb-4 w-full">
          {/* Label for the date */}
          <label
            htmlFor="issuance-date"
            className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left"
          >
            Issuance date<span className="text-red-400">*</span>
          </label>
          {/* Date Dropdowns */}
          <div className="flex flex-row space-x-4 items-center">
            {/* Year Dropdown */}
            <select
              id="document-date-year"
              value={props.newDocument.date?.split("-")[0] || ""}
              onChange={(e) => handleFieldChange("year", e.target.value)}
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
                isDarkMode ? "dark-mode" : "light-mode"
              } ${
                errors.date
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
            >
              <option value="" disabled selected>
                Year
              </option>
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            {/* Month Dropdown */}
            <select
              id="document-date-month"
              value={props.newDocument.date?.split("-")[1] || ""}
              disabled={!Boolean(props.newDocument.date?.split("-")[0])} // Check if year is seleceted
              onChange={(e) => handleFieldChange("month", e.target.value)}
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md disabled:opacity-30 ${
                isDarkMode ? "dark-mode" : "light-mode"
              } ${
                errors.date
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
            >
              <option value="" selected>
                Month
              </option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            {/* Day Dropdown */}
            <select
              value={props.newDocument.date?.split("-")[2] || ""}
              onChange={(e) => handleFieldChange("day", e.target.value)}
              id="document-date-day"
              disabled={!Boolean(props.newDocument.date?.split("-")[1])} // Check if month is seleceted
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md disabled:opacity-30 ${
                isDarkMode ? "dark-mode" : "light-mode"
              } ${
                errors.date
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
            >
              <option value="" selected>
                Day
              </option>
              {Array.from(
                {
                  length: calculateDaysInMonth(
                    parseInt(props.newDocument.date?.split("-")[0]), // year
                    parseInt(props.newDocument.date?.split("-")[1]) // month
                  ),
                },
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Old Date */}
        {/* <div className="input-date mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Issuance date<span className="text-red-400">*</span>
          </label>
          <input
            id="document-date"
            type="date"
            value={props.newDocument.date}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
              isDarkMode ? "dark-mode" : "light-mode"
            } ${
              errors.date
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
            } focus:outline-none`}
          />
        </div> */}
        {/* Type */}
        <div className="input-type mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Type<span className="text-red-400">*</span>
          </label>
          <select
            id="document-type"
            value={props.newDocument.type}
            onChange={(e) => handleFieldChange("typeId", e.target.value)}
            className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${
              errors.type
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
            } focus:outline-none`}
          >
            <option value="none">None</option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        {/* Language */}
        <div className="input-language mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Language
          </label>
          <select
            id="document-language"
            value={props.newDocument.language}
            onChange={(e) => handleFieldChange("language", e.target.value)}
            className="w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md focus:border-blue-400 border-1 border-transparent focus:outline-none"
          >
            <option value="">None</option>
            {popularLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        {/* Pages */}
        <div className="input-number mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Pages
          </label>
          <input
            id="number-input"
            type="number"
            value={props.newDocument.pages}
            placeholder="Select a number"
            onChange={(e) => handleFieldChange("pages", e.target.value)}
            className="w-full text-base px-3 py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md focus:border-blue-400 border-1 border-transparent :outline-none"
          ></input>
        </div>
        {/* Description */}
        <div className="input-description mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Description<span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="Description"
            value={props.newDocument.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className={`w-full p-2 px-3 py-2 text-base text-text-black_text dark:text-white_text border-gray-300 placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark  ${
              errors.description
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
            } focus:outline-none`}
            rows="4"
          ></textarea>
        </div>
        {/* Georeference */}
        <div className="input-map mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Georeference
          </label>
          {props.newAreaId && (
            <label className="text-black_text dark:text-white_text text-base w-full text-left py-1">
              <i className="bi bi-check-lg align-middle text-green-400"></i> You
              selected{" "}
              {props.newAreaId === 1 ? "Municipality Area" : `a Georeference`}
            </label>
          )}
          <button
            onClick={() => {
              navigate("/map");
            }}
            className="w-full p-2 text-white_text dark:text-black_text text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] hover:bg-[#000000] dark:hover:bg-customGray1 :transition rounded-md"
          >
            <i className="bi bi-globe-europe-africa"></i> Open the Map
          </button>
        </div>
        {/* Linking */}
        <div className="input-link mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Linking
          </label>
          {props.connections && props.connections.length > 0 && (
            <p className="m-0 px-2 py-1 text-gray-500">
              {props.connections.length + " connections selected"}
            </p>
          )}
          <button
            onClick={() => {
              props.setNavShow(false);
              props.setMode("return");
              navigate("/linkDocuments");
            }}
            className="w-full p-2 text-white_text dark:text-black_text text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] hover:bg-[#000000] dark:hover:bg-customGray1 :transition rounded-md"
          >
            {" "}
            Select Documents to Link
          </button>
        </div>
        {/* Save Button */}
        <button
          className="bg-primary_color_light dark:bg-primary_color_dark w-full hover:bg-[#2E6A8E66] transition  text-lg dark:text-white_text text-black_text py-2 px-4 rounded-lg mt-4"
          onClick={handleConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AddDocumentForm;