
import React from 'react';

const AboutUsPage: React.FC = () => {
    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">About FilmySky</h1>
            <div className="space-y-4 text-[var(--secondary-text-color)] leading-relaxed">
                <p>
                    Welcome to FilmySky, your premier destination for the latest movies and web series. Our mission is to provide an extensive library of entertainment content in a user-friendly and accessible format.
                </p>
                <p>
                    At FilmySky, we focus on bringing you the latest releases as quickly as possible. We operate as a search engine, indexing links to content that is publicly available on the internet, much like how major search engines like Google operate.
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">Our Content Policy</h2>
                <p>
                    It is important for our users to understand that we do not host any of the video files on our own servers. All content featured on our platform is provided by non-affiliated third parties. We do not have any control over the content hosted on these external sites, nor do we have any involvement in the uploading or downloading process.
                </p>
                <p>
                    Our platform is designed to make discovering new content easier. We simply find and organize links for our users' convenience. We are not responsible for the accuracy, legality, or any other aspect of the content on third-party sites.
                </p>
                <p>
                    Thank you for choosing FilmySky. We hope you enjoy the experience!
                </p>
            </div>
        </div>
    );
};

export default AboutUsPage;
