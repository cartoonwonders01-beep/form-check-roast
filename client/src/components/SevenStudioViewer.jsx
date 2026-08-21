import VectorPushupAnimator from './VectorPushupAnimator';
import SavageXRayScanner from './SavageXRayScanner';
import SevenAthleteViewer from './SevenAthleteViewer';

export default function SevenStudioViewer({
  viewMode = '2d_vector', // '2d_vector' | 'form_xray' | 'real_athlete'
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

  if (viewMode === 'form_xray') {
    return (
      <SavageXRayScanner
        character={character}
        isPlaying={isPlaying}
        roastData={roastData}
        onTriggerRoast={onTriggerRoast}
        isLoadingRoast={isLoadingRoast}
        onVoicePlay={onVoicePlay}
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
