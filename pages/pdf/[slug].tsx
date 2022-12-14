
import React, { useState, useEffect } from 'react';
import { client } from '../../utils/client';
import { useRouter } from 'next/router';
import { motion } from "framer-motion"
import Layout from '../layout';
import { toast } from 'react-hot-toast';

const ViewPdf = () => {
    const router = useRouter();
    const [response, setResponse] = useState({
        paper_title: '',
        paper_summary: '',
        paper_url: '',
    });
    const [response2, setResponse2] = useState({ answer: '' });
    let { slug } = router.query;
    slug = slug?.toString();
    slug = slug?.replace(/-/g, ' ');
    const [loading, setLoading] = useState(false);
    let currentString = '';
    const [explainQuery, setExplainQuery] = useState('');


    useEffect(() => {
        client.post('/', { query: slug })
            .then(res => {
                setResponse(res.data.papers[0]);
            })
            .catch(err => {
                console.error(err)
            });

    }, [slug]);

    const handleQuerySubmit = (e: any) => {
        e.preventDefault();
        setLoading(true);
        client.post('/explain', { query: explainQuery })
            .then(res => {
                setResponse2(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
            })
        addToCurrentString();
    }

    function addToCurrentString() {
        if (currentString.length <= response2?.answer.length) {
            currentString += response2?.answer[currentString.length];

            setTimeout(addToCurrentString, 200);
        }
    }

    return (
        <Layout >
            <div className='flex'>
                <div className='flex flex-col w-[50vw] h-screen'>
                    <h1 className='text-2xl border-b-2 border-black font-bold m-2 p-2'>{slug}</h1>

                    <motion.div initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className='flex flex-col items-center justify-center w-[100%] h-[80%]'>
                        <h2 className="font-bold text-xl mt-2">Explain Paper</h2>
                        <p className="text-sm">Copy paste text here</p>
                        <form onSubmit={handleQuerySubmit} className='w-full mt-8 flex flex-col items-center justify-center'>
                            <textarea rows={6} className='rounded-md focus:outline-none border-2 py-4 px-8 w-[80%]' value={explainQuery} onChange={(e) => setExplainQuery(e.target.value)} placeholder='Enter Your Query Here...' />
                            <button className='border border-black hover:bg-slate-100 rounded-md p-2 px-4 m-2'>Explain</button>
                        </form>
                        {
                            response2 &&
                            <div className="m-4 p-4 w-[40vw]">
                                {response2?.answer}
                            </div>
                        }
                        {
                            loading &&
                            <div className="m-4 p-4">Loading Explanation through Open AI...</div>
                        }
                    </motion.div>
                </div>
                {
                    response ?
                        <embed id="iframe-text" className="rounded h-screen w-[50vw]" src={response?.paper_url.replace("http://", "https://")}></embed>
                        :
                        <div className="flex flex-col items-center justify-center h-screen w-[50vw]">
                            Loading PDF from Arxiv...
                        </div>
                }
            </div>
        </Layout>
    )
}

export default ViewPdf;