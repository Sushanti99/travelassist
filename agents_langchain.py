import os
from typing import Dict, List, Any, Optional
import json

# LangChain imports
from langchain.tools import StructuredTool  # Use StructuredTool instead of Tool
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import MessagesPlaceholder, ChatPromptTemplate, HumanMessagePromptTemplate, \
    SystemMessagePromptTemplate
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

# Import your custom API modules (assumed to be in separate files)
from gmaps import get_directions  # Import your Google Maps API function
from weatherapi import get_current_weather  # Import your Weather API function
from airqualityindex import get_air_quality  # Import your Air Quality API function

# Set your API key
openai_key = "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"
OPENAI_API_KEY = openai_key
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

# Initialize LLM
llm = ChatOpenAI(temperature=0, model="gpt-4o-mini")


# Create functions for the tools with properly typed arguments
def google_maps_directions_tool(origin: str, destination: str, mode: str = "driving") -> Dict[str, Any]:
    """
    Get directions between two locations.

    Args:
        origin: Starting location (e.g., "Berkeley, CA")
        destination: Ending location (e.g., "San Francisco, CA")
        mode: Transportation mode (driving, walking, bicycling, transit)

    Returns:
        Dictionary with directions data.
    """
    try:
        # Call your imported Google Maps function
        directions_data = get_directions(origin, destination, mode)

        return directions_data

    except Exception as e:
        return {"error": f"Error processing Google Maps directions: {str(e)}"}


def weather_api_tool(location: str) -> Dict[str, Any]:
    """
    Get current weather information for a location.

    Args:
        location: A location string like "Berkeley, CA" or coordinates.

    Returns:
        Dictionary with weather data.
    """
    try:
        # Clean input
        location = location.strip()

        # Call your imported Weather API function
        weather_data = get_current_weather(location)

        return weather_data

    except Exception as e:
        return {"error": f"Error processing Weather API: {str(e)}"}


def air_quality_tool(location: str) -> Dict[str, Any]:
    """
    Get air quality information for a location.

    Args:
        location: A location string like "Berkeley, CA" or coordinates.

    Returns:
        Dictionary with air quality data.
    """
    try:
        # Clean input
        location = location.strip()

        # Call your imported Air Quality API function
        air_quality_data = get_air_quality(location)

        return air_quality_data

    except Exception as e:
        return {"error": f"Error processing Air Quality API: {str(e)}"}


# Create the orchestrator agent
def create_travel_recommendation_agent():
    # Create tools using the StructuredTool class
    tools = [
        StructuredTool.from_function(
            func=google_maps_directions_tool,
            name="google_maps_directions",
            description="""
            Use this tool to get directions between two locations.
            Provide the origin (starting location), destination (ending location), and optionally the mode of transportation (driving, walking, bicycling, transit).
            """
        ),
        StructuredTool.from_function(
            func=weather_api_tool,
            name="weather_api",
            description="""
            Use this tool to get current weather information for a location.
            Provide the location as a string like "Berkeley, CA" or coordinates.
            """
        ),
        StructuredTool.from_function(
            func=air_quality_tool,
            name="air_quality_api",
            description="""
            Use this tool to get air quality information for a location.
            Provide the location as a string like "Berkeley, CA" or coordinates.
            """
        )
    ]

    # Define the orchestrator agent prompt with the required agent_scratchpad
    system_message = """You are an eco-friendly travel recommendation assistant that helps users find the most environmentally friendly way to travel between locations while considering weather and air quality conditions.

Your job is to:
1. Understand the user's travel needs
2. Get directions using the Google Maps tool
3. Check weather conditions at the origin, destination, and along the route
4. Check air quality at the origin, destination, and along the route
5. Analyze the data to provide personalized, environmentally-friendly travel recommendations
6. Explain your reasoning and the environmental benefits of your recommendations

When making recommendations, consider:
- Carbon footprint of different transportation modes
- Weather conditions and their impact on different modes
- Air quality and its health implications
- Practicality and time constraints

Always prioritize lower-carbon options when reasonable, but balance environmental benefits with practical considerations like weather, distance, and time constraints.

For each recommendation, provide:
1. PRIMARY RECOMMENDATION: A clear, concise primary travel recommendation
2. ALTERNATIVES: 1-2 alternative options with their pros and cons
3. ENVIRONMENTAL IMPACT: Quantified environmental impact where possible
4. WEATHER CONSIDERATIONS: How weather affected your recommendation
5. AIR QUALITY CONSIDERATIONS: How air quality affected your recommendation
6. PRACTICAL TIPS: Additional tips for the journey

Format your response in a structured, easy-to-read manner with clear sections.
"""

    # Create the prompt with the required agent_scratchpad placeholder
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(system_message),
        HumanMessagePromptTemplate.from_template("{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])

    agent = create_openai_functions_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    return agent_executor


# Function to process a travel request
def get_eco_travel_recommendations(origin: str, destination: str, preferences: Optional[Dict[str, Any]] = None) -> Dict[
    str, Any]:
    """
    Process a travel request and provide eco-friendly recommendations.

    Parameters:
    - origin: Starting location
    - destination: Ending location
    - preferences: Optional dictionary with user preferences like:
      - max_walking_distance: Maximum walking distance in km
      - max_travel_time: Maximum acceptable travel time in minutes
      - prioritize_weather: Boolean to indicate if weather comfort is important
      - prioritize_air_quality: Boolean to indicate if air quality is important

    Returns:
    - Dictionary with recommendations and supporting data
    """
    # Initialize preferences if not provided
    if preferences is None:
        preferences = {}

    # Create the agent
    agent = create_travel_recommendation_agent()

    # Construct the query
    query = f"""I need eco-friendly travel recommendations from {origin} to {destination}."""

    # Add preferences to the query if provided
    if preferences:
        query += " My preferences are:"
        if "max_walking_distance" in preferences:
            query += f" I'm willing to walk up to {preferences['max_walking_distance']} km."
        if "max_travel_time" in preferences:
            query += f" I need to arrive within {preferences['max_travel_time']} minutes."
        if preferences.get("prioritize_weather", False):
            query += " Weather comfort is important to me."
        if preferences.get("prioritize_air_quality", False):
            query += " Air quality is important for my health."

    # Execute the agent
    response = agent.invoke({"input": query})

    return response


# Analyze travel recommendations and create a comprehensive response
def analyze_and_create_recommendations(agent_response):
    """
    Process the raw agent response and create a structured recommendation
    """
    # This function would process the agent's output to create a standardized response
    # In a real implementation, you would parse the agent's output and format it consistently

    # For now, we'll assume the agent's output is well-structured and just pass it through
    return {
        "success": True,
        "recommendations": agent_response.get("output"),
        "raw_data": {
            "directions_data": agent_response.get("directions_data"),
            "weather_data": agent_response.get("weather_data"),
            "air_quality_data": agent_response.get("air_quality_data")
        }
    }


# Example usage
if __name__ == "__main__":
    # Example: Get recommendations for traveling from Berkeley to San Francisco
    result = get_eco_travel_recommendations(
        origin="Berkeley, CA",
        destination="San Francisco, CA",
        preferences={
            "max_walking_distance": 2,
            "prioritize_air_quality": True
        }
    )

    # Process and structure the recommendations
    final_recommendations = analyze_and_create_recommendations(result)

    # Print the final recommendations
    print(json.dumps(final_recommendations, indent=2))