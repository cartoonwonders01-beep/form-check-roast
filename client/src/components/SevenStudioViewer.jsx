import VectorPushupAnimator from './VectorPushupAnimator';
import ThreeCharacterStudio from './ThreeCharacterStudio';
import SevenAthleteViewer from './SevenAthleteViewer';

export default function SevenStudioViewer({
  viewMode = '2d_vector', // '2d_vector' | '3d_mocap' | 'real_athlete'
  character = 'humanoid',
  exercise = 'pushup',
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast,
  onVoicePlay
}) {
  if (viewMode === '2d_vector') {
    return (
      <VectorPushupAnimator
        character={character}
        isPlaying={isPlaying}
        roastData={roastData}
        onTriggerRoast={onTriggerRoast}
        isLoadingRoast={isLoadingRoast}
        onVoicePlay={onVoicePlay}
      />
    );
  }

  if (viewMode === '3d_mocap') {
    return (
      <ThreeCharacterStudio
        character={character}
        exercise={exercise}
        isPlaying={isPlaying}
        roastData={roastData}
        onTriggerRoast={onTriggerRoast}
        isLoadingRoast={isLoadingRoast}
      />
    );
  }

  return (
    <SevenAthleteViewer
      exercise={exercise}
      isPlaying={isPlaying}
      roastData={roastData}
      onTriggerRoast={onTriggerRoast}
      isLoadingRoast={isLoadingRoast}
      character={character}
    />
  );
}
