"use client";

import ResumeGraph from '@/components/resumeGraph.component';
import Background from '@/components/background.component';
import MenuBar from '@/components/manuBar.component';


interface Props {
    params: { userId: number };
}

const ResumeTest: React.FC<Props> = ({ params: { userId } }) => {

    console.log('userIdResume: ' + userId)
    return (
        <>
            <Background />
            <MenuBar href="/principal" />
            <ResumeGraph userId={userId} />
        </>
    );
};

export default ResumeTest;
