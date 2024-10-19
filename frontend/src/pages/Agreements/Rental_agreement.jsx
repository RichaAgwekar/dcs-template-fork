/**
 * @file RentalAgreement.js
 * @description This component represents a rental agreement form that allows users to fill in details
 *              related to a rental agreement. It generates a preview of the filled agreement and enables
 *              users to download it as a PDF.
 */

import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import '../../css/Rental_agreement.css';
import emblem from '../../images/emblem.jpeg'

/**
 * @component RentalAgreement
 * @description A functional component that renders a rental agreement form and a preview of the filled
 *              agreement. Users can fill in details such as landlord name, tenant name, property address,
 *              lease period, dates, monthly rent, and deposit amount. The component provides functionality to
 *              download the filled form as a PDF file.
 * @returns {JSX.Element} The Rental Agreement form and preview rendered within a div container.
 */
// Step 1: Define the Document component input required
const RentalAgreement = () => {
    const [formData, setFormData] = useState({
      LandlordName: '',
      TenantName: '',
      PropertyAddress: '',
      LeasePeriod: '',
      FromDate: '',
      ToDate: '',
      MonthlyRent: '',
      DepositAmount: ''
    });
  
    /**
     * Handles input changes for the form fields.
     * @param {string} field - The field name of the form data being updated.
     * @param {string|number} value - The value to be set for the specified field.
     */
    //To handle input change
    const handleInputChange = (field, value) => {
      setFormData(prevData => ({ ...prevData, [field]: value }));
    };
  
    /**
     * Handles the download of the rental agreement as a PDF.
     * @function handleDownload
     * @description This function captures the HTML content of the rental agreement preview and uses html2pdf.js
     *              to generate and download a PDF file. It hides the download button and the form while generating
     *              the PDF and restores them afterward.
     */
    //For downloading pdf
    const handleDownload = () => {
      const element = document.getElementById('preview');
      const today = new Date();
      const formattedDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  
      const opt = {
        margin: 0.5,
        filename: `Rental_Agreement_${formattedDate}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      const downloadButton = document.getElementById('downloadBtn');
    downloadButton.style.display = 'none';

    const formcontainer = document.getElementById('form_container');
    formcontainer.style.display = 'none';

    const previewcontainer = document.getElementById('preview');
    previewcontainer.style.width = '90%';

      html2pdf().from(element).set(opt).save().then(() => {
      downloadButton.style.display = 'block';
      formcontainer.style.display = 'block';
      previewcontainer.style.width = '48%';
    });   
    };
  
    /**
     * Formats a date string into a more readable format (dd-mmm-yyyy).
     * @param {string} dateString - The date string to be formatted.
     * @returns {string} The formatted date string in the form of dd-mmm-yyyy.
     */
    //To display date in dd-mmm-yyyy format
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };


    //To dynamically display input fields from formData taking values from const RentalAgreement
    return (
      <div className="container">
        <div className="form-container" id="form_container">
          <h2>Rental Agreement Form</h2>
          <form id="rentalForm">
            {Object.keys(formData).map((key) => (
              <label key={key}>
                {key.replace(/([A-Z])/g, ' $1')}: 
                <input 
                  type={key.includes('Date') ? 'date' : (key.includes('Rent') || key.includes('Amount') ? 'number' : 'text')}
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`} 
                  onChange={(e) => handleInputChange(key, e.target.value)} 
                />
                <br />
              </label>
            ))}
          </form>
        </div>
        {/* Preview Section*/}       
        <div className="preview-container" id="preview">
        <img src={emblem} alt="Emblem" className="preview-image" />

          <h2>Rental Agreement Preview</h2>
          <br />
          <br />
          <div id="preview-box" className="preview-box">
            <h3 className="preview-text">1. Parties, Leased Property, Terms and Payment</h3>
            <p className="preview-text">This Agreement is made between <strong>{formData.LandlordName || '___________'}</strong> (Landlord) and <strong>{formData.TenantName || '___________'}</strong> (Tenant).</p>
            <p className="preview-text">The landlord hereby agrees to rent the property located at <strong>{formData.PropertyAddress || '___________'}</strong>.</p>
            <p className="preview-text">The lease period is <strong>{formData.LeasePeriod || '___________'}</strong>, starting from <strong>{formData.FromDate ? formatDate(formData.FromDate) : '___________'}</strong> to <strong>{formData.ToDate ? formatDate(formData.ToDate) : '___________'}</strong>.</p>
            <p className="preview-text">The agreed rent is Rs <strong>{formData.MonthlyRent ? `Rs ${formData.MonthlyRent}` : '___________'}</strong> per month.</p>
            <p className="preview-text">The deposit amount is Rs <strong>{formData.DepositAmount ? `Rs ${formData.DepositAmount}` : '___________'}</strong> to be paid at the execution of this Agreement.</p>
          
          <h3 className="preview-text">2. Use of Leased Property</h3>
          <p className="preview-text">The Landlord agrees to use the leased property as per the terms and conditions of this Agreement.</p>
          
          <h3 className="preview-text">3.Utilities</h3>
          <p>The Tenant agrees to pay for the utilities and other services used in the Property during the term of this Agreement.</p>
          
          <h3 className="preview-text">4.Repairs and damages</h3>
          <p>Any losses and damages to fixture furnishing shall be defrayed by the Tenant. If any reasonable repair is necessary for the fixture furnishing, the Tenant shall notify it to the Landlord. The Landlord shall defray reasonable repair costs of fixture furnishing.</p>
          
          <h3 className="preview-text">5. Termination</h3>
          <p>This Agreement automatically expires at the end of the specified period above.<br/>However, this Agreement shall be terminated with mutual written consent of the</p>
            
             {/* Signature Section */}
          <div className="signature-container">
            <div className="signature-box">
              <p>Landlord Signature:</p>
              <br/>
              <div className="signature-line"><strong>{formData.LandlordName || '___________'}</strong></div>
            </div>
            <div className="signature-box">
              <p>Tenant Signature:</p>
              <br/>
              <div className="signature-line"><strong>{formData.TenantName || '___________'}</strong></div>
            </div>
          </div>
        </div>
          <button id="downloadBtn" onClick={handleDownload}>Download PDF</button>
        </div>
      </div>
    );
  };
  
  export default RentalAgreement;