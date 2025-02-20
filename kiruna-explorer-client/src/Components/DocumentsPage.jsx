import { useState, useEffect } from "react";
import "./document.css";
import Alert from "./Alert.jsx";
import { SingleDocument } from "./SingleDocument.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import API from "../API/API.mjs";
import { useLocation } from "react-router-dom";


import FilterMenu from "./FilterMenu.jsx";
import FilterLabels from "./FilterLabels.jsx";
import AddDocumentForm from "./AddDocumentForm.jsx";
import DocumentItem from "./DocumentItem.jsx";

function DocumentsPage(props) {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  let { open } = location.state || false;
  const [isOpen, setIsOpen] = useState(open);
  const [documents, setDocuments] = useState([]);

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState(""); // User's input
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  // --- Filter ---
  // --- Filter ---
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen((prevState) => !prevState);
  };
  const [filterValues, setFilterValues] = useState({
    type: "",
    stakeholders: [],
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNumberOfPages, setTotalNumberOfPages] = useState(1);
  const numberOfDocumentsInPage = 5;
  const nextPage = () => {
    if (currentPage < totalNumberOfPages) setCurrentPage((prev) => prev + 1);
  };
  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  // --- Update Documents List ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery); // Update debounced query after delay
    }, 500); // Wait 500ms

    return () => {
      clearTimeout(handler); // Clear timeout if searchQuery changes before 500ms
    };
  }, [searchQuery]);
  useEffect(() => {
    if(isOpen) {
      props.setIsModalOpen(true);
      setIsOpen(false);
      open = false;
    }
    const fetchFilteredDocuments = async () => {
      try {
        // Fetch paginated documents
        const data = await API.getPaginatedFilteredDocuments({
          ...filterValues,
          title: debouncedQuery,
          offset: ((currentPage - 1) * numberOfDocumentsInPage).toString(),
        });

        // Fetch all filtered documents to calculate total pages
        const allData = await API.getFilteredDocuments({
          ...filterValues,
          title: debouncedQuery,
        });

        // Calculate total pages
        setTotalNumberOfPages(
          Math.ceil(allData.length / numberOfDocumentsInPage)
        );

        // Set the paginated documents
        setDocuments(data);
      } catch (err) {
        console.error("Error fetching documents:", err.message);
      }
    };

    fetchFilteredDocuments();
  }, [filterValues, debouncedQuery, currentPage, numberOfDocumentsInPage]);
  useEffect(() => {
    // If filters change, reset the current page to 1
    setCurrentPage(1);
  }, [filterValues, debouncedQuery]);
  // --- others ---
  const [alertMessage, setAlertMessage] = useState(["", ""]);

  useEffect(() => {
    props.setNavShow(true);
  }, []);

  const toggleModal = () => {
    props.setIsModalOpen(!props.isModalOpen);
  };

  return (
    <div className={isDarkMode ? "dark" : "light"}>
      <div className="bg-background_color_light dark:bg-background_color min-h-screen flex flex-col h-full overflow-hidden">
        <SingleDocument
          updateAreaId={props.updateAreaId}
          setUpdateAreaId={props.setUpdateAreaId}
          setNavShow={props.setNavShow}
          municipalGeoJson={props.municipalGeoJson}
          setMode={props.setMode}
          setoriginalDocId={props.setoriginalDocId}
          setAlertMessage={setAlertMessage}
          setShowArea={props.setShowArea}
        ></SingleDocument>
        <Alert
          message={alertMessage[0]}
          type={alertMessage[1]}
          clearMessage={() => setAlertMessage(["", ""])}
        ></Alert>
        <div className="sticky-top w-full bg-[#ffffff55] dark:bg-[#313131ef] rounded-b-md h-16">
          <div className="flex flex-row justify-content-between align-items-center h-16 w-full ps-[5.5rem] pe-[3.4rem]">
            <div className="flex flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="z-[0] relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color lg:md:w-72 sm:w-48 py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="relative lg:hidden">
              {/* Filter Button */}
              <button
                className="text-black_text dark:text-white_text text-2xl"
                onClick={toggleFilterMenu}
              >
                <i className="bi bi-sort-down-alt"></i>
              </button>

              {/* Conditional Filter Menu */}
              {isFilterMenuOpen && (
                <div className="absolute top-full min-w-80 left-0 -ml-10 -mt-32 z-50 transform scale-50">
                  <FilterMenu
                    filterValues={filterValues}
                    setFilterValues={setFilterValues}
                    toggleFilterMenu={toggleFilterMenu}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-row justify-content-end gap-3 align-items-center">
              {/* Add document Button */}
              <button
                onClick={toggleModal}
                className="bg-primary_color_light dark:bg-primary_color_dark hover:bg-[#2E6A8E66] transition text-black_text dark:text-white_text flex flex-row gap-2 justify-items-end py-2 px-3 rounded-md"
              >
                <i className="bi bi-file-earmark-plus"></i>
                <p className="text-base m-0 p-0 lg:inline-block md:inline-block max-sm:hidden">
                  Add document
                </p>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full h-[calc(100vh-4rem)]">
          <div className="flex-col justify-content-between pb-3 mt-3 mx-7 w-1/4 overflow-auto hidden lg:block">
            {/* Filter Menu */}
            <FilterMenu
              homePage={true}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
            />
            {/* Pagination Controls */}
            {/* <PaginationControls
              previousPage={previousPage}
              currentPage={currentPage}
              totalNumberOfPages={totalNumberOfPages}
              nextPage={nextPage}
            /> */}
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-3/4 overflow-y-scroll mr-7 pt-3 px-3">
            {/* Filter Labels */}
            <div className="w-full lg:hidden">
              <FilterLabels
                filterValues={filterValues}
                setFilterValues={setFilterValues}
              />
            </div>
            {/* Documents List */}
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                documentId={doc.id}
                title={doc.title}
                type={doc.type}
                date={doc.date}
                stakeholders={doc.stakeholders}
                isDarkMode={isDarkMode}
              />
            ))}
            <div className=" w-min self-center -mt-28">
              {/* Pagination Controls */}
              <PaginationControls
                previousPage={previousPage}
                currentPage={currentPage}
                totalNumberOfPages={totalNumberOfPages}
                nextPage={nextPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Document Form */}
      {props.isModalOpen && (
        <AddDocumentForm
          updateAreaId={props.updateAreaId}
          setUpdateAreaId={props.setUpdateAreaId}
          setoriginalDocId={props.setoriginalDocId}
          setMode={props.setMode}
          connections={props.connections}
          setConnections={props.setConnections}
          setNavShow={props.setNavShow}
          setIsModalOpen={props.setIsModalOpen}
          isModalOpen={props.isModalOpen}
          newAreaId={props.newAreaId}
          setnewAreaId={props.setnewAreaId}
          setNewDocument={props.setNewDocument}
          newDocument={props.newDocument}
          setAlertMessage={setAlertMessage}
          toggleModal={toggleModal}
        />
      )}
    </div>
  );
}

export default DocumentsPage;

function PaginationControls({
  previousPage,
  currentPage,
  totalNumberOfPages,
  nextPage,
}) {
  return (
    <div className="flex flex-row items-center justify-between py-2 text-black_text dark:text-white_text bg-[#ffffff55] dark:bg-box_color mt-28 rounded-lg">
      <i
        className="ml-3 bi bi-arrow-left cursor-pointer text-3xl"
        onClick={previousPage}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            previousPage();
          }
        }}
      />
      <div className="text-xl">
        <span className="bg-primary_color_light dark:bg-customBlue rounded-md px-2">
          {currentPage}
        </span>
        <span className="mx-2 px-2">of</span>
        <span className="px-2">{totalNumberOfPages}</span>
      </div>

      <i
        className="mr-3 bi bi-arrow-right cursor-pointer  text-3xl"
        onClick={nextPage}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            nextPage();
          }
        }}
      />
    </div>
  );
}
