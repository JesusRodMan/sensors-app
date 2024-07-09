"use client";

import ArduinoGraph from '@/components/arduinoGraph.component';
import Background from '@/components/background.component';

interface Props {
    params: { id: Number, areaId: number };
  }

const StatsRealTime: React.FC<Props> = ({
    params: { id, areaId },
  }) => {
    console.log(id)
    return (
        <>
            <Background/>
            <ArduinoGraph idMuscle={id} idArea={areaId} />
            </>
    );
};

export default StatsRealTime;
