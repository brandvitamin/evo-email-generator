export default EmailGeneratorUpload;  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">EVO by Bord Products - Email Generator</h1>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
        <div className="mb-4">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-2 text-sm text-gray-500">
            Upload a CSV file with your contact information. The CSV should have columns for 
            "Specifier Contact: Name", "Specifier Meeting Date", "ARC Representative", 
            "Action Required", "Current Projects", and "Specifier Needs".
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleGenerate}
            disabled={loading || !file}
          >
            {loading ? 'Generating...' : 'Generate Emails'}
          </button>
          
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleCopyCSV}
            disabled={!csvContent || loading}
          >
            Copy CSV to Clipboard
          </button>
          
          <button 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleSaveCSV}
            disabled={!csvContent || loading}
          >
            Download CSV
          </button>
        </div>
      </div>
      
      {/* Status Message */}
      {status && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          {status}
        </div>
      )}
      
      {/* Results Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Email list */}
        {emails.length > 0 && (
          <div className="md:w-1/3">
            <h2 className="text-xl font-bold mb-3">Generated Emails ({emails.length})</h2>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <ul className="divide-y">
                {emails.map((email, index) => (
                  <li 
                    key={index}
                    className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedEmail === email ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <p className="font-medium">{email.name}</p>
                    <p className="text-sm text-gray-600">{email.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Email preview */}
        {selectedEmail && (
          <div className="md:w-2/3">
            <h2 className="text-xl font-bold mb-3">Email Preview</h2>
            <div className="border rounded-lg p-4 bg-white">
              <p className="mb-2"><strong>To:</strong> {selectedEmail.name} ({selectedEmail.email})</p>
              <p className="mb-4"><strong>Subject:</strong> {selectedEmail.subject}</p>
              <div className="border-t pt-4 whitespace-pre-wrap">
                {selectedEmail.content}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* CSV Preview */}
      {csvContent && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">CSV Preview</h2>
          <textarea 
            className="w-full h-40 p-2 border rounded font-mono text-sm"
            value={csvContent}
            readOnly
          />
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How to Use</h2>
        <ol className="list-decimal pl-5">
          <li className="mb-2">Click "Browse" to select your CSV file</li>
          <li className="mb-2">Click "Generate Emails" to process your data</li>
          <li className="mb-2">Review the generated emails by clicking on a contact</li>
          <li className="mb-2">Click "Download CSV" to save the email content as a CSV file</li>
          <li className="mb-2">Alternatively, click "Copy CSV to Clipboard" to copy the CSV content</li>
        </ol>
      </div>
    </div>
  );
};import React, { useState } from 'react';

// Import papaparse for CSV handling
const Papa = window.Papa || { parse: () => {}, unparse: () => {} };

const EmailGeneratorUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(`File selected: ${selectedFile.name}`);
    }
  };
  
  const handleGenerate = async () => {
    if (!file) {
      setStatus('Please select a CSV file first.');
      return;
    }
    
    try {
      setLoading(true);
      setStatus('Processing CSV file...');
      
      // Read file content
      const fileContent = await readFileAsText(file);
      
      // Parse the CSV
      const parsedData = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true
      }).data;
      
      setStatus(`Generating emails for ${parsedData.length} contacts...`);
      
      const generatedEmails = [];
      
      // Process each row
      parsedData.forEach(row => {
        // Check for required fields
        if (!row['Specifier Contact:  Name'] || !row['Action Required']) {
          return; // Skip incomplete rows
        }
        
        // Extract required information
        const fullName = row['Specifier Contact:  Name'];
        const firstName = extractFirstName(fullName);
        const email = row['Specifier Contact: Email'];
        const meetingDate = formatDate(row['Specifier Meeting Date']);
        const arcRep = row['ARC Representative'];
        const arcRepFirstName = extractFirstName(arcRep);
        const actionRequired = row['Action Required'];
        const currentProjects = row['Current Projects'] || '';
        const specifierNeeds = row['Specifier Needs'] || '';
        
        // Filter out exterior/facade mentions
        const filteredNeeds = specifierNeeds.replace(/\bexterior\b|\bfacade\b/gi, '');
        
        // Generate email content
        const emailContent = createEmailContent(
          firstName,
          meetingDate,
          arcRepFirstName,
          actionRequired,
          currentProjects,
          filteredNeeds
        );
        
        // Generate subject line
        const subject = createSubjectLine(meetingDate, arcRepFirstName, actionRequired);
        
        // Add to emails array
        generatedEmails.push({
          name: fullName,
          email: email,
          subject: subject,
          content: emailContent
        });
      });
      
      // Generate CSV
      const csvData = generatedEmails.map(email => ({
        Name: email.name,
        Subject: email.subject,
        EmailContent: email.content
      }));
      
      setEmails(generatedEmails);
      setCsvContent(Papa.unparse(csvData));
      setStatus(`Generated ${generatedEmails.length} emails successfully.`);
      setLoading(false);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setLoading(false);
    }
  };
  
  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  
  const handleCopyCSV = () => {
    if (!csvContent) {
      setStatus('No CSV content to copy.');
      return;
    }
    
    navigator.clipboard.writeText(csvContent)
      .then(() => {
        setStatus('CSV copied to clipboard!');
      })
      .catch(() => {
        setStatus('Failed to copy to clipboard. Please copy manually.');
      });
  };
  
  const handleSaveCSV = () => {
    if (!csvContent) {
      setStatus('No CSV content to save.');
      return;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'EVO_Follow_Up_Emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Helper functions
  const extractFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate();
      const month = date.toLocaleString('en-GB', { month: 'long' });
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };
  
  const createSubjectLine = (meetingDate, arcRepFirstName, actionRequired) => {
    if (actionRequired === 'PDF information') {
      return `EVO by Bord Products - Follow-up from your ${meetingDate} meeting with ${arcRepFirstName}`;
    } else if (actionRequired === 'PDF information & indicative pricing') {
      return `EVO Information & Pricing - Follow-up from your ${meetingDate} meeting with ${arcRepFirstName}`;
    } else if (actionRequired === 'PDF information, Indicative pricing & samples requested') {
      return `EVO Collection - Follow-up from your ${meetingDate} meeting with ${arcRepFirstName}`;
    } else {
      return `EVO by Bord Products - Follow-up from your ${meetingDate} meeting with ${arcRepFirstName}`;
    }
  };
  
  const analyzeProjectDetails = (projectString) => {
    const projectTypes = [];
    const budgetLevels = [];
    const buildTypes = [];
    
    // Check for project types
    ['Residential', 'Multi-Residential', 'Commercial', 'Fit Out', 'Hospitality'].forEach(type => {
      if (projectString.includes(type)) {
        projectTypes.push(type);
      }
    });
    
    // Check for budget levels
    ['High', 'Mid', 'Low'].forEach(level => {
      if (projectString.includes(level)) {
        budgetLevels.push(level);
      }
    });
    
    // Check for build types
    ['New Build', 'Alteration', 'Renovation', 'Extension'].forEach(type => {
      if (projectString.includes(type)) {
        buildTypes.push(type);
      }
    });
    
    return {
      projectTypes,
      budgetLevels,
      buildTypes
    };
  };
  
  const extractApplicationInterests = (needsString) => {
    const interests = [];
    
    // Standard application interests
    ['joinery', 'wall', 'cabinetry', 'panelling'].forEach(app => {
      if (needsString.toLowerCase().includes(app)) {
        interests.push(app);
      }
    });
    
    // Special case for ceiling panelling
    if (needsString.toLowerCase().includes('ceiling')) {
      interests.push('ceiling panelling');
    }
    
    return interests;
  };
  
  const selectBenefits = (projectDetails, applicationInterests) => {
    // Define benefits based on project types
    const residentialBenefits = [
      "Hyperrealistic 3D surfaces that perfectly mimic natural timber with Japanese-engineered precision",
      "Ultra-low VOC emissions that create healthier living spaces, free from PVC, BPA, formaldehyde, and harmful additives",
      "UV-resistant technology tested for 2,000 hours, maintaining color integrity even in sun-filled residential spaces",
      "Invisible antimicrobial protection for healthier family environments",
      "Scratch and stain-resistant surfaces that stand up to the demands of daily family life"
    ];
    
    const multiResidentialBenefits = [
      "Perfect color matching across multi-stage developments, ensuring visual consistency throughout the entire project",
      "Flawless color consistency and precision-matched grains across entire apartment complexes and large-scale developments",
      "Rapid lead times that keep multi-residential projects on schedule - just 1-3 days for standard products",
      "Durable surfaces that maintain their appearance in high-traffic multi-residential environments",
      "Environmentally responsible materials that support green building standards for multi-residential developments"
    ];
    
    const commercialBenefits = [
      "Superior durability that stands up to high-traffic commercial environments",
      "Factory pre-finished surfaces that reduce installation time and labor costs in commercial projects",
      "Precision color matching that ensures visual consistency throughout phased commercial developments",
      "Fast lead times that keep commercial fit-out schedules on track - just 10-15 days for custom requirements",
      "Chemical and water-resistant surfaces ideal for commercial spaces and high-moisture environments"
    ];
    
    const hospitalityBenefits = [
      "Antimicrobial protection that creates safer, more hygienic hospitality environments",
      "Scratch and stain-resistant surfaces that maintain their appearance in busy hospitality settings",
      "Precision-matched grains for cohesive visual aesthetics throughout hospitality venues",
      "Easy-to-clean surfaces that reduce maintenance costs in hospitality environments",
      "Exceptional durability that withstands the demands of high-traffic hospitality spaces"
    ];
    
    const wallPanellingBenefits = [
      "Finely textured 3D embossing that creates stunning visual impact for wall and ceiling panelling",
      "Precision-matched grains that ensure perfect visual alignment across large wall and ceiling installations"
    ];
    
    const joineryCabinetryBenefits = [
      "Exceptional durability and scratch resistance for high-use joinery applications",
      "Matching ABS edge banding for perfect finishing on cabinetry and joinery"
    ];
    
    const generalBenefits = [
      "Factory pre-finished and ready to fabricate, reducing installation time and labour costs",
      "Flawless color consistency and precision-matched grains for perfect visual outcomes",
      "Exceptional durability with scratch, stain, and water resistance for long-term performance",
      "Ultra-low VOC emissions and free from PVC, BPA, formaldehyde, and harmful additives",
      "Japanese-engineered 3D olefin surfaces that capture the depth and texture of natural timber"
    ];
    
    const selectedBenefits = [];
    
    // Add benefits based on project types
    if (projectDetails.projectTypes.includes('Residential')) {
      selectedBenefits.push(...residentialBenefits.slice(0, 2));
    }
    
    if (projectDetails.projectTypes.includes('Multi-Residential')) {
      selectedBenefits.push(...multiResidentialBenefits.slice(0, 2));
    }
    
    if (projectDetails.projectTypes.includes('Commercial')) {
      selectedBenefits.push(...commercialBenefits.slice(0, 2));
    }
    
    if (projectDetails.projectTypes.includes('Hospitality')) {
      selectedBenefits.push(...hospitalityBenefits.slice(0, 2));
    }
    
    // Add benefits based on application interests
    const hasWallOrCeiling = applicationInterests.some(interest => 
      ['wall', 'panelling', 'ceiling panelling'].includes(interest)
    );
    
    if (hasWallOrCeiling) {
      selectedBenefits.push(...wallPanellingBenefits);
    }
    
    const hasJoineryOrCabinetry = applicationInterests.some(interest => 
      ['joinery', 'cabinetry'].includes(interest)
    );
    
    if (hasJoineryOrCabinetry) {
      selectedBenefits.push(...joineryCabinetryBenefits.slice(0, 1));
    }
    
    // If we don't have enough benefits, add general ones
    if (selectedBenefits.length < 3) {
      selectedBenefits.push(...generalBenefits.slice(0, 5 - selectedBenefits.length));
    }
    
    // Limit to 5 benefits and remove duplicates
    return [...new Set(selectedBenefits)].slice(0, 5);
  };
  
  const createEmailContent = (
    firstName,
    meetingDate,
    arcRepFirstName,
    actionRequired,
    currentProjects,
    specifierNeeds
  ) => {
    // Extract project details
    const projectDetails = analyzeProjectDetails(currentProjects);
    
    // Extract application interests
    const applicationInterests = extractApplicationInterests(specifierNeeds);
    
    // Select benefits
    const benefits = selectBenefits(projectDetails, applicationInterests);
    
    // Determine project type mention
    const projectTypeMention = projectDetails.projectTypes.length > 0
      ? projectDetails.projectTypes.join(' and ')
      : 'current';
    
    // Generate email content
    let content = '';
    
    // Common introduction
    content += `Dear ${firstName},\n\n`;
    content += `Thank you for taking the time to meet with ${arcRepFirstName} on ${meetingDate} to discuss EVO by Bord Products. It was a pleasure to introduce our next-generation decorative timber surfaces and learn more about your ${projectTypeMention} projects.\n\n`;
    
    // Benefits section with appropriate heading
    let benefitsHeading = '';
    if (actionRequired === 'PDF information') {
      benefitsHeading = 'Why EVO is perfect for your projects:';
    } else if (actionRequired === 'PDF information & indicative pricing') {
      benefitsHeading = 'Why EVO stands out for your projects:';
    } else {
      benefitsHeading = 'Why EVO is ideal for your work:';
    }
    
    content += `${benefitsHeading}\n\n`;
    
    // Add benefits as bullet points
    benefits.forEach(benefit => {
      content += `• ${benefit}\n`;
    });
    content += '\n';
    
    // Quick details section - varies by action required
    if (actionRequired === 'PDF information') {
      content += 'Quick details:\n\n';
      content += '• Available on pre-finished MDF, MR MDF, and Birch Plywood substrates (PEFC-certified on request)\n';
      content += '• Sheet sizes: 2400x1200mm, 3000x1200mm, 3600x1200mm\n';
      content += '• Thickness range: 3.5-40.5mm\n';
      content += '• Lead time: 1-3 days (double-sided 18mm MR MDF), 10-15 days (other substrates)\n';
      content += '• 7-year warranty\n\n';
    } else if (actionRequired === 'PDF information & indicative pricing') {
      content += 'Pricing & specs:\n\n';
      content += '• From $89 per square meter\n';
      content += '• Available on pre-finished MDF, MR MDF, and Birch Plywood substrates (PEFC-certified on request)\n';
      content += '• Sheet sizes: 2400x1200mm, 3000x1200mm, 3600x1200mm\n';
      content += '• Thickness range: 3.5-40.5mm\n';
      content += '• Lead time: 1-3 days (double-sided 18mm MR MDF), 10-15 days (other)\n';
      content += '• Volume discounts available\n\n';
    } else if (actionRequired === 'PDF information, Indicative pricing & samples requested') {
      content += 'Quick details:\n\n';
      content += '• From $89 per square meter (volume discounts available)\n';
      content += '• Available on pre-finished MDF, MR MDF, and Birch Plywood substrates (PEFC-certified on request)\n';
      content += '• Sheet sizes: 2400x1200mm, 3000x1200mm, 3600x1200mm\n';
      content += '• Thickness range: 3.5-40.5mm\n';
      content += '• Lead time: 1-3 days (double-sided 18mm MR MDF), 10-15 days (other)\n\n';
      
      // Add sample request section with address confirmation
      content += 'About your sample request:\n\n';
      content += 'I\'ll arrange for samples to be dispatched this week. To make sure they get to you, could you please confirm your mailing address?\n\n';
      content += 'I\'ve also attached our brochure and technical specifications for your reference. Please feel free to contact me with any questions about incorporating EVO into your projects.\n';
    }
    
    // Attachments statement and closing
    if (actionRequired === 'PDF information') {
      content += 'I\'ve attached our product brochure and technical specifications with detailed information on applications and performance characteristics.\n\n';
      content += 'Please don\'t hesitate to reach out if you have any questions or would like to discuss how EVO could work for specific elements of your projects. If you\'d like to see and feel the quality of our EVO surfaces, I\'d be happy to arrange for samples to be sent to you.\n\n';
    } else if (actionRequired === 'PDF information & indicative pricing') {
      content += `I\'ve attached our brochure and technical specifications showcasing applications for your ${projectTypeMention} needs.\n\n`;
      content += 'Please feel free to contact me with any questions about incorporating EVO into your projects or if you\'d like more specific information. If you\'d like to see the quality of our surfaces firsthand, I\'d be happy to arrange for samples to be sent to you.\n\n';
    }
    
    // Standard closing for all emails
    content += 'Looking forward to hearing from you.';
    
    return content;
  };
