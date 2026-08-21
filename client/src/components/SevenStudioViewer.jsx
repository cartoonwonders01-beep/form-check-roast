import SevenAthleteViewer from './SevenAthleteViewer';
import ThreeCharacterStudio from './ThreeCharacterStudio';

export default function SevenStudioViewer({
  character = 'humanoid',
  exercise = 'pushup',
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast
}) {
  return (
    <div className="w-full">
      {character === 'humanoid' ? (
        <SevenAthleteViewer
          exercise={exercise}
          isPlaying={isPlaying}
          roastData={roastData}
          onTriggerRoast={onTriggerRoast}
          isLoadingRoast={isLoadingRoast}
          character={character}
        />
      ) : (
        <ThreeCharacterStudio
          character={character}
          exercise={exercise}
          isPlaying={isPlaying}
          roastData={roastData}
          onTriggerRoast={onTriggerRoast}
          isLoadingRoast={isLoadingRoast}
        />
      )}
    </div>
  );
}
