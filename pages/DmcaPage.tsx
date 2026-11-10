
import React from 'react';

const DmcaPage: React.FC = () => {
    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">DMCA</h1>
            <div className="space-y-4 text-[var(--secondary-text-color)] leading-relaxed">
                <p>
                    All parts of the FilmySky website are for private use only.
                </p>
                <p>
                    No files are hosted on our server. All contents are provided by non-affiliated third parties. They are only indexed much like how Google works.
                </p>
                <p>
                    FilmySky does not accept responsibility for content hosted on third party websites and does not have any involvement in the downloading/uploading of movies. We just post links available on the internet.
                </p>
                <p>
                    This site merely indexes other sites' contents. The hosting server or the administrator cannot be held responsible for the contents of any linked sites or any link contained in a linked site, or changes/updates to such sites.
                </p>
                <p>
                    For any copyright issues, you should contact the hosters files sites itself.
                </p>
                <p>
                    If you still have or need further information please send us a message through our contact page. Please allow 1-2 business days for an email response.
                </p>
            </div>
        </div>
    );
};

export default DmcaPage;
