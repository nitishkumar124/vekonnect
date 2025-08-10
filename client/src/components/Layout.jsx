import React from 'react';
import Sidebar from 'Sidebar.jsx'; // <--- IMPORT THE NEW SIDEBAR COMPONENT

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex"> {/* <--- Added 'flex' here */}
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-grow ml-64 p-4"> {/* <--- Added 'flex-grow' and 'ml-64' */}
                <div className="container mx-auto max-w-2xl"> {/* Limit content width for better readability */}
                    {children} {/* This is where your page components will be rendered */}
                </div>
            </main>
            {/* You could add a Footer here */}
        </div>
    );
};

export default Layout;
